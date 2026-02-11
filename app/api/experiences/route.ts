import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation (server-side)
    const company = String(body.company || '').trim();
    const role = String(body.role || '').trim();
    const country = String(body.country || '').trim();
    const happened = String(body.happened || '').trim();

    if (!company || !role || !country || happened.length < 50) {
      return NextResponse.json({ ok: false, error: 'Validation failed.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data, error } = await supabase
      .from('experiences')
      .insert([
        {
          company,
          agency: body.agency ? String(body.agency).trim() : null,
          role,
          country,
          happened,
          evidence: body.evidence ? String(body.evidence).trim() : null,
          contact_email: body.contact_email ? String(body.contact_email).trim() : null,
          consent: !!body.consent,
          source: 'dev',
        },
      ])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request.' }, { status: 400 });
  }
}
