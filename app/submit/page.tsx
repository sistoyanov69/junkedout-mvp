"use client";

import { useState } from "react";

type FormState = {
  company: string;
  agency: string;
  role: string;
  country: string;
  happened: string;
  evidence: string;
  email: string;
  consent: boolean;
};

export default function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    company: "",
    agency: "",
    role: "",
    country: "",
    happened: "",
    evidence: "",
    email: "",
    consent: false,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.company.trim()) return "Company name is required.";
    if (!form.role.trim()) return "Role / position is required.";
    if (!form.country.trim()) return "Country is required.";
    if (form.happened.trim().length < 50)
      return "Please describe what happened (minimum 50 characters).";
    if (!form.consent)
      return "Consent is required (we store anonymized, GDPR-aware data).";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const err = validate();
    if (err) {
      setStatus("error");
      setMessage(err);
      return;
    }

    setStatus("submitting");

    try {
      // MVP v1: no DB yet. We only simulate a successful submit.
      // Next step: replace this with a POST to /api/submissions.
      await new Promise((r) => setTimeout(r, 500));

      setStatus("ok");
      setMessage("Submitted. Thank you — your experience helps build reliable evidence.");
      setForm({
        company: "",
        agency: "",
        role: "",
        country: "",
        happened: "",
        evidence: "",
        email: "",
        consent: false,
      });
    } catch {
      setStatus("error");
      setMessage("Submission failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Submit Experience</h1>
          <p className="text-gray-300">
            Share a hiring experience. We aim to collect <span className="font-semibold">reliable</span>,
            <span className="font-semibold"> real-world</span> evidence of systemic unfairness.
          </p>
          <p className="text-sm text-gray-400">
            Tip: Avoid personal data (names, phone numbers, addresses). Focus on process, dates,
            outcomes, and verifiable facts.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Company (required)">
              <input
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="e.g., BigTech GmbH"
              />
            </Field>

            <Field label="Recruitment agency (optional)">
              <input
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white"
                value={form.agency}
                onChange={(e) => update("agency", e.target.value)}
                placeholder="e.g., AgencyName (if applicable)"
              />
            </Field>

            <Field label="Role / position (required)">
              <input
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g., IT Manager / Mainframe Lead"
              />
            </Field>

            <Field label="Country of hiring process (required)">
              <input
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="e.g., Bulgaria / Germany / Netherlands"
              />
            </Field>

            <Field label="What happened? (required, min 50 chars)">
              <textarea
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white min-h-36"
                value={form.happened}
                onChange={(e) => update("happened", e.target.value)}
                placeholder="Describe the timeline, steps, and outcome. Avoid personal data."
              />
            </Field>

            <Field label="Evidence / references (optional)">
              <textarea
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white min-h-24"
                value={form.evidence}
                onChange={(e) => update("evidence", e.target.value)}
                placeholder="e.g., 'Rejection email received 2026-01-15', 'ATS auto-reject in 2 minutes', etc."
              />
            </Field>

            <Field label="Email (optional - only if you want follow-up)">
              <input
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none focus:border-white"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <label className="flex items-start gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />
              <span>
                I understand JunkedOut stores this submission in a GDPR-aware way (anonymized where possible),
                and I will not include personal data of myself or others.
              </span>
            </label>
          </div>

          {message && (
            <div
              className={`rounded-md px-4 py-3 text-sm border ${
                status === "ok"
                  ? "border-green-500 text-green-200"
                  : "border-red-500 text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-lg bg-white text-black font-semibold py-3 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </button>

          <p className="text-xs text-gray-500">
            MVP note: This currently simulates a submit (no database yet). Next step: save to backend.
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-300">{label}</div>
      {children}
    </div>
  );
}
