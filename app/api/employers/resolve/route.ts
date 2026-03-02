import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * EU VIES VAT validation (SOAP)
 * We keep it minimal and resilient:
 * - validate VAT format client-side (basic)
 * - call VIES SOAP endpoint
 * - parse <valid>, <name>, <address>
 *
 * Note: VIES can be slow/unavailable sometimes; treat network errors as "UNAVAILABLE".
 */

const ResolveSchema = z.object({
  employer_ref_id: z.string().uuid().optional(), // optional: if provided we update employer_refs + audit
  country: z.string().trim().length(2),
  legal_name: z.string().trim().min(2).max(200).optional(),
  identifier_type: z.enum(['VAT', 'REG_NUMBER', 'LEI', 'DUNS', 'OTHER']),
  identifier_value: z.string().trim().min(2).max(64),
});

type ViesResult =
  | {
      status: 'VERIFIED_VIES';
      vat_valid: true;
      country: string;
      vat: string;
      vies_name: string | null;
      vies_address: string | null;
    }
  | {
      status: 'NOT_VALID_VIES';
      vat_valid: false;
      country: string;
      vat: string;
      vies_name: string | null;
      vies_address: string | null;
    }
  | {
      status: 'UNAVAILABLE';
      reason: string;
      country: string;
      vat: string;
    };

function normalizeVat(country: string, raw: string) {
  const c = country.toUpperCase();
  const v = raw.replace(/\s+/g, '').toUpperCase();
  // Allow users to paste with/without country prefix
  if (v.startsWith(c)) return { country: c, vatNumber: v.slice(2) };
  return { country: c, vatNumber: v };
}

function buildViesEnvelope(country: string, vatNumber: string) {
  // VIES SOAP checkVat request
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soap:Body>
    <tns:checkVat>
      <tns:countryCode>${country}</tns:countryCode>
      <tns:vatNumber>${vatNumber}</tns:vatNumber>
    </tns:checkVat>
  </soap:Body>
</soap:Envelope>`;
}

function extractTag(xml: string, tag: string): string | null {
  // Very small XML extraction (no external deps)
  // Handles <tag>value</tag> and namespace variants like <ns2:valid>...</ns2:valid>
  const re = new RegExp(`<[^>]*${tag}[^>]*>([\\s\\S]*?)<\\/[^>]*${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return null;
  const val = m[1]?.trim();
  if (!val) return '';
  // Decode basic XML entities
  return val
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function checkVatVies(country: string, vatRaw: string): Promise<ViesResult> {
  const { country: cc, vatNumber } = normalizeVat(country, vatRaw);

  // Basic sanity check; VIES does per-country validation anyway.
  if (!/^[A-Z]{2}$/.test(cc) || !/^[A-Z0-9.+*-]{2,20}$/.test(vatNumber)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'Invalid VAT format.',
      country: cc,
      vat: `${cc}${vatNumber}`,
    };
  }

  const envelope = buildViesEnvelope(cc, vatNumber);

  let res: Response;
  try {
    res = await fetch('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '',
      },
      body: envelope,
      // Next.js (Node) default timeout is not explicit; keep this simple for v0
      cache: 'no-store',
    });
  } catch (e: unknown) {
    return {
      status: 'UNAVAILABLE',
      reason: e instanceof Error ? e.message : 'Network error',
      country: cc,
      vat: `${cc}${vatNumber}`,
    };
  }

  const xml = await res.text();

  // VIES can return SOAP Fault when service is down / invalid input
  if (!res.ok || /<\s*Fault\b/i.test(xml)) {
    const fault = extractTag(xml, 'faultstring');
    return {
      status: 'UNAVAILABLE',
      reason: fault ?? `VIES error (HTTP ${res.status})`,
      country: cc,
      vat: `${cc}${vatNumber}`,
    };
  }

  const validStr = extractTag(xml, 'valid');
  const name = extractTag(xml, 'name');
  const address = extractTag(xml, 'address');

  const isValid = (validStr ?? '').toLowerCase() === 'true';

  if (isValid) {
    return {
      status: 'VERIFIED_VIES',
      vat_valid: true,
      country: cc,
      vat: `${cc}${vatNumber}`,
      vies_name: name && name !== '---' ? name : null,
      vies_address: address && address !== '---' ? address : null,
    };
  }

  return {
    status: 'NOT_VALID_VIES',
    vat_valid: false,
    country: cc,
    vat: `${cc}${vatNumber}`,
    vies_name: name && name !== '---' ? name : null,
    vies_address: address && address !== '---' ? address : null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResolveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'ValidationError', message: 'Invalid input.' },
        { status: 422 }
      );
    }

    const data = parsed.data;

    if (data.identifier_type !== 'VAT') {
      return NextResponse.json(
        {
          ok: false,
          error: 'NotImplemented',
          message: 'Only VAT (VIES) resolution is implemented in this version.',
        },
        { status: 400 }
      );
    }

    const result = await checkVatVies(data.country, data.identifier_value);

    // Optional: update employer_refs + write audit event if employer_ref_id provided
    if (data.employer_ref_id) {
      const supabase = supabaseAdmin();

      // Always audit the attempt
      await supabase.from('audit_events').insert({
        actor: 'system',
        action: 'EMPLOYER_RESOLVE_VIES',
        entity_type: 'employer_ref',
        entity_id: data.employer_ref_id,
        meta: {
          input: {
            country: data.country,
            legal_name: data.legal_name ?? null,
            identifier_type: data.identifier_type,
            identifier_value: data.identifier_value,
          },
          result,
        },
      });

      // Update status only on definitive results
      if (result.status === 'VERIFIED_VIES') {
        await supabase
          .from('employer_refs')
          .update({ resolution_status: 'VERIFIED_VIES' })
          .eq('id', data.employer_ref_id);
      } else if (result.status === 'NOT_VALID_VIES') {
        await supabase
          .from('employer_refs')
          .update({ resolution_status: 'NOT_VALID_VIES' })
          .eq('id', data.employer_ref_id);
      }
    }

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Resolver error';
    return NextResponse.json({ ok: false, error: 'ServerError', message: msg }, { status: 500 });
  }
}
