import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SubmitSchema } from "@/lib/submit/schema";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// very lightweight PII heuristics (v0)
function detectPII(text: string): boolean {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phone = /(\+?\d[\d\s().-]{7,}\d)/;
  return email.test(text) || phone.test(text);
}

/**
 * Map backend schema keys -> current UI field names.
 * Anything unmapped falls under "_form".
 */
const FIELD_MAP: Record<string, string> = {
  employer_legal_name: "company",
  employer_country: "country",
  job_title: "role",
  narrative: "happened",
  evidence_notes: "evidence",
  contact_email: "email",
  consent_terms: "consentTruthful",
  consent_no_pii: "consentNoPII",
};

function zodToFieldErrors(error: z.ZodError) {
  const out: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const rawKey = String(issue.path?.[0] ?? "_form");
    const uiKey = FIELD_MAP[rawKey] ?? "_form";
    if (!out[uiKey]) out[uiKey] = [];
    out[uiKey].push(issue.message || "Invalid value.");
  }

  // de-dupe
  for (const k of Object.keys(out)) {
    out[k] = Array.from(new Set(out[k]));
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "ValidationError",
          message: "Please correct the highlighted fields.",
          fieldErrors: zodToFieldErrors(parsed.error),
        },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // honeypot check (bots often fill it)
    if (data.hp && data.hp.trim() !== "") {
      // pretend success, but do not store anything
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = supabaseAdmin();

    // 1) Insert employer_ref
    const { data: employer, error: empErr } = await supabase
      .from("employer_refs")
      .insert({
        country: data.employer_country,
        input_name: data.employer_legal_name,
        input_city: data.employer_city ?? null,
        input_website: data.employer_website ?? null,
        identifier_type: data.employer_identifier_type ?? null,
        identifier_value: data.employer_identifier_value ?? null,
        resolution_status: "UNRESOLVED",
      })
      .select("id")
      .single();

    if (empErr) throw empErr;

    // 2) Insert report_raw
    const piiFlag =
      detectPII(data.narrative) ||
      (data.rejection_message_excerpt ? detectPII(data.rejection_message_excerpt) : false);

    // Provide safe defaults (schema already defaults, but we keep it explicit here too)
    const jobFamily = data.job_family ?? "OTHER";
    const seniority = data.seniority ?? "UNKNOWN";
    const source = data.source ?? "OTHER";
    const processStage = data.process_stage ?? "APPLIED_ONLY";
    const outcome = data.outcome ?? "REJECTED";
    const issueTypes = data.issue_types && data.issue_types.length ? data.issue_types : ["OTHER"];

    const evidenceAvailable = Boolean(data.evidence_available);
    const evidenceTypes = evidenceAvailable ? (data.evidence_types ?? []) : null;

    const { data: report, error: repErr } = await supabase
      .from("reports_raw")
      .insert({
        schema_version: data.schema_version,

        consent_terms: data.consent_terms,
        consent_no_pii: data.consent_no_pii,
        consent_followup: data.contact_email ? true : (data.consent_followup ?? false),

        employer_ref_id: employer.id,

        job_title: data.job_title,
        job_family: jobFamily,
        seniority: seniority,
        contract: data.contract ?? null,
        work_mode: data.work_mode ?? null,
        job_location_country: data.job_location_country ?? null,
        job_location_city: data.job_location_city ?? null,
        source: source,
        job_post_url: data.job_post_url ?? null,

        applied_at: data.applied_at ?? null,
        response_at: data.response_at ?? null,
        process_stage: processStage,
        outcome: outcome,
        ghosted_days: outcome === "GHOSTED" ? (data.ghosted_days ?? null) : null,

        requirements_listed: data.requirements_listed ?? [],
        requirements_met: data.requirements_met ?? null,
        self_match_rating: data.self_match_rating ?? null,

        issue_types: issueTypes,

        rejection_stated: data.rejection_stated ?? null,
        rejection_stated_text: data.rejection_stated_text ?? null,
        rejection_message_excerpt: data.rejection_message_excerpt ?? null,

        rejection_assumed: data.rejection_assumed ?? null,
        assumption_basis: data.assumption_basis ?? null,
        assumption_basis_text: data.assumption_basis_text ?? null,

        evidence_available: evidenceAvailable,
        evidence_types: evidenceTypes,
        evidence_notes: data.evidence_notes ?? null,

        narrative: data.narrative,

        pii_flag: piiFlag,
        client_fingerprint: data.client_fingerprint ?? null,
      })
      .select("id, created_at")
      .single();

    if (repErr) throw repErr;

    // 3) Optional contact record (token stored as hash)
    let contactConfirmationToken: string | null = null;

    if (data.contact_email) {
      contactConfirmationToken = randomToken(32);
      const tokenHash = sha256Hex(contactConfirmationToken);
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

      const { error: contactErr } = await supabase.from("report_contacts").insert({
        report_id: report.id,
        email: data.contact_email,
        followup_opt_in: true,
        updates_opt_in: data.contact_opt_in_updates ?? false,
        token_hash: tokenHash,
        token_expires_at: expires.toISOString(),
      });

      if (contactErr) throw contactErr;

      // audit event (server-side)
      await supabase.from("audit_events").insert({
        actor: "system",
        action: "CONTACT_CONFIRMATION_TOKEN_CREATED",
        entity_type: "report",
        entity_id: report.id,
        meta: { expires_at: expires.toISOString() },
      });
    }

    // audit event: submission
    await supabase.from("audit_events").insert({
      actor: "anon",
      action: "REPORT_SUBMITTED",
      entity_type: "report",
      entity_id: report.id,
      meta: {
        schema_version: data.schema_version,
        employer_country: data.employer_country,
        pii_flag: piiFlag,
      },
    });

    // v0 response: return a public receipt code (not the UUID if you prefer)
    const res: {
  ok: true;
  report_id: string;
  contact?: {
    confirmation_required: true;
  };
} = {
  ok: true,
  report_id: report.id,
};


    if (contactConfirmationToken) {
      res.contact = {
        confirmation_required: true,
        // DO NOT return token in production responses.
      };
    }

    return NextResponse.json(res, { status: 200 });
  } catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : "Unknown error";

  return NextResponse.json(
    { ok: false, error: "ServerError", message },
    { status: 500 }
  );
 }
}
