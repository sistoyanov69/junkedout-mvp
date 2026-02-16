import { z } from "zod";

const ISO2 = z.string().trim().length(2);

export const Requirements = z.enum([
  "YEARS_EXPERIENCE",
  "SPECIFIC_SKILLS",
  "DEGREE_CERT",
  "LANGUAGE",
  "LOCATION_RELOCATION",
  "WORK_AUTHORIZATION",
  "SALARY_EXPECTATIONS",
  "PORTFOLIO_GITHUB",
  "OTHER",
]);

/**
 * SubmitSchema (v0)
 * - Compatible with the current minimal UI (company/role/country/happened/evidence/email/consents)
 * - Also supports richer fields for later UI expansion.
 * - Provides safe defaults so the backend can insert into DB without requiring UI to send everything yet.
 */
export const SubmitSchema = z
  .object({
    schema_version: z.literal("report.v0").default("report.v0"),

    // consents
    consent_terms: z.literal(true, { errorMap: () => ({ message: "You must confirm good-faith submission." }) }),
    consent_no_pii: z.literal(true, { errorMap: () => ({ message: "You must confirm you did not include personal data in the narrative." }) }),
    consent_followup: z.boolean().optional().default(false),

    // honeypot (should be empty)
    hp: z.string().optional().default(""),

    // employer identity (minimal required now)
    employer_country: ISO2,
    employer_legal_name: z.string().trim().min(2, "Company name is required.").max(200),
    employer_identifier_type: z.enum(["EIK", "VAT", "REG_NUMBER", "OTHER"]).optional(),
    employer_identifier_value: z.string().trim().min(2).max(32).optional(),
    employer_city: z.string().trim().max(120).optional(),
    employer_website: z.string().url().max(400).optional(),

    // job (minimal required now)
    job_title: z.string().trim().min(2, "Role / Position is required.").max(120),

    // defaults for later enrichment (NOT required by current UI)
    job_family: z
      .enum([
        "IT",
        "ENGINEERING",
        "FINANCE",
        "SALES",
        "MARKETING",
        "HR",
        "OPERATIONS",
        "CUSTOMER_SUPPORT",
        "HEALTHCARE",
        "EDUCATION",
        "LEGAL",
        "OTHER",
      ])
      .optional()
      .default("OTHER"),

    seniority: z
      .enum(["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER", "DIRECTOR", "EXECUTIVE", "UNKNOWN"])
      .optional()
      .default("UNKNOWN"),

    contract: z.enum(["PERMANENT", "TEMPORARY", "FREELANCE", "INTERNSHIP", "UNKNOWN"]).optional().default("UNKNOWN"),
    work_mode: z.enum(["ONSITE", "HYBRID", "REMOTE", "UNKNOWN"]).optional().default("UNKNOWN"),
    job_location_country: ISO2.optional(),
    job_location_city: z.string().trim().max(120).optional(),

    source: z.enum(["COMPANY_WEBSITE", "LINKEDIN", "RECRUITER", "JOB_BOARD", "REFERRAL", "OTHER"]).optional().default("OTHER"),
    job_post_url: z.string().url().max(600).optional(),

    // dates (optional)
    applied_at: z.string().date().optional(), // yyyy-mm-dd
    response_at: z.string().date().optional(),

    // pipeline + outcome (defaulted for minimal UI)
    process_stage: z
      .enum(["APPLIED_ONLY", "SCREENING", "ASSESSMENT", "INTERVIEW_HR", "INTERVIEW_TECH", "FINAL_ROUND", "OFFER_WITHDRAWN"])
      .optional()
      .default("APPLIED_ONLY"),

    outcome: z.enum(["REJECTED", "GHOSTED", "WITHDRAWN_BY_CANDIDATE", "OTHER"]).optional().default("REJECTED"),
    ghosted_days: z.number().int().min(1).max(365).optional(),

    // requirements / self-assessment (optional)
    requirements_listed: z.array(Requirements).optional().default([]),
    requirements_met: z.array(Requirements.or(z.literal("PREFER_NOT_TO_SAY"))).optional(),
    self_match_rating: z.number().int().min(1).max(5).optional(),
    requirements_met_explanation: z.string().trim().max(500).optional(),

    // issue types (default for minimal UI)
    issue_types: z.array(z.string().trim().min(2)).optional().default(["OTHER"]),

    // rejection details (optional)
    rejection_stated: z
      .enum([
        "NOT_SELECTED_UNSPECIFIED",
        "POSITION_FILLED",
        "ROLE_CANCELLED",
        "MISSING_REQUIRED_SKILLS",
        "INSUFFICIENT_EXPERIENCE",
        "OVERQUALIFIED",
        "SALARY_MISMATCH",
        "LOCATION_MISMATCH",
        "WORK_AUTH_REQUIRED",
        "FAILED_ASSESSMENT",
        "CULTURE_FIT",
        "OTHER_STATED",
      ])
      .optional(),
    rejection_stated_text: z.string().trim().max(200).optional(),
    rejection_message_excerpt: z.string().trim().max(300).optional(),

    rejection_assumed: z.array(z.string().trim().min(2)).optional(),
    assumption_basis: z.array(z.string().trim().min(2)).optional(),
    assumption_basis_text: z.string().trim().max(300).optional(),

    // evidence metadata-only
    evidence_available: z.boolean().optional().default(false),
    evidence_types: z.array(z.string().trim().min(2)).optional(),
    evidence_notes: z.string().trim().max(300).optional(),

    // narrative (required now)
    narrative: z.string().trim().min(50, "Description must be at least 50 characters.").max(4000),

    // optional contact
    contact_email: z.string().email("Email is not valid.").max(254).optional(),
    contact_opt_in_followup: z.boolean().optional(),
    contact_opt_in_updates: z.boolean().optional().default(false),

    // optional signals
    client_fingerprint: z.string().trim().max(120).optional(),
  })
  .superRefine((v, ctx) => {
    // employer id type/value coupling
    if (v.employer_identifier_type && !v.employer_identifier_value) {
      ctx.addIssue({
        code: "custom",
        message: "Company identifier value is required when identifier type is provided.",
        path: ["employer_identifier_value"],
      });
    }

    // response_at >= applied_at (string compare works for ISO dates)
    if (v.applied_at && v.response_at && v.response_at < v.applied_at) {
      ctx.addIssue({
        code: "custom",
        message: "Response date must be after application date.",
        path: ["response_at"],
      });
    }

    // ghosted rule
    if (v.outcome === "GHOSTED" && !v.ghosted_days) {
      ctx.addIssue({
        code: "custom",
        message: "Ghosted days is required when outcome is GHOSTED.",
        path: ["ghosted_days"],
      });
    }

    // rejection stated other
    if (v.rejection_stated === "OTHER_STATED" && !v.rejection_stated_text) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the stated rejection reason.",
        path: ["rejection_stated_text"],
      });
    }

    // evidence rule (only enforce if evidence_available=true)
    if (v.evidence_available && (!v.evidence_types || v.evidence_types.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Evidence type(s) required when evidence is available.",
        path: ["evidence_types"],
      });
    }

    // contact rule
    if (v.contact_email) {
      if (v.contact_opt_in_followup !== true) {
        ctx.addIssue({
          code: "custom",
          message: "You must allow follow-up when providing email.",
          path: ["contact_opt_in_followup"],
        });
      }
    }
  });

export type SubmitInput = z.infer<typeof SubmitSchema>;
