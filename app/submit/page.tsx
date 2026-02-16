'use client';

import { useMemo, useRef, useState } from 'react';

type FormState = {
  company: string;
  agency: string;
  role: string;
  country: string;
  happened: string;
  evidence: string;
  email: string;
  consentTruthful: boolean;
  consentNoPII: boolean;
};

type FieldErrors = Record<string, string[]>;

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>({
    company: '',
    agency: '',
    role: '',
    country: '',
    happened: '',
    evidence: '',
    email: '',
    consentTruthful: false,
    consentNoPII: true,
  });

  // Honeypot (hidden)
  const [hp, setHp] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  // Top banner message (general)
  const [error, setError] = useState<string | null>(null);

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Refs used for "scroll to first error"
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const orderedFields = useMemo(
    () => [
      'company',
      'agency',
      'role',
      'country',
      'happened',
      'evidence',
      'email',
      'consentNoPII',
      'consentTruthful',
    ],
    []
  );

  function setFieldRef(name: string) {
    return (el: HTMLElement | null) => {
      refs.current[name] = el;
    };
  }

  function hasErr(name: keyof FormState | 'consentTruthful' | 'consentNoPII') {
    return Boolean(fieldErrors[name]?.length);
  }

  function inputClass(name: keyof FormState) {
    return [
      'w-full p-3 rounded bg-gray-900 border',
      hasErr(name) ? 'border-red-500' : 'border-gray-700',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      hasErr(name) ? 'focus:ring-red-500' : 'focus:ring-gray-500',
    ].join(' ');
  }

  function helpText(name: string) {
    const msgs = fieldErrors[name];
    if (!msgs?.length) return null;
    return (
      <div className="mt-1 space-y-1">
        {msgs.map((m, idx) => (
          <p key={`${name}-${idx}`} className="text-sm text-red-300">
            {m}
          </p>
        ))}
      </div>
    );
  }

  function scrollToFirstError(nextErrors: FieldErrors) {
    for (const name of orderedFields) {
      if (nextErrors[name]?.length) {
        const el = refs.current[name];
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // As user edits a field, clear its errors (nice UX)
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }

  function setLocalErrors(next: FieldErrors, banner?: string) {
    setFieldErrors(next);
    setError(banner ?? 'Please correct the highlighted fields.');
    setSuccess(false);
    setReceipt(null);
    scrollToFirstError(next);
  }

  function validateClient(): FieldErrors {
    const errs: FieldErrors = {};

    if (!form.company.trim()) errs.company = ['Company name is required.'];
    if (!form.role.trim()) errs.role = ['Role / Position is required.'];
    if (!form.country.trim()) errs.country = ['Country is required.'];
    if ((form.happened || '').trim().length < 50)
      errs.happened = ['Description must be at least 50 characters.'];

    if (!form.consentNoPII)
      errs.consentNoPII = ['You must confirm you did not include personal data in the narrative.'];
    if (!form.consentTruthful)
      errs.consentTruthful = ['You must confirm good-faith submission.'];

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = ['Email is not valid (example: name@domain.com).'];

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setReceipt(null);

    // Client-side validation for immediate feedback
    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length) {
      setLocalErrors(clientErrs, 'Please correct the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      // Map current UI fields into report.v0 payload (server can normalize later)
      const payload = {
        schema_version: 'report.v0' as const,

        consent_terms: form.consentTruthful,
        consent_no_pii: form.consentNoPII,
        consent_followup: Boolean(form.email.trim()),
        hp,

        employer_country: form.country.trim(),
        employer_legal_name: form.company.trim(),
        employer_identifier_type: null,
        employer_identifier_value: null,

        job_title: form.role.trim(),

        // Evidence metadata-only
        evidence_available: Boolean(form.evidence.trim()),
        evidence_types: form.evidence.trim() ? ['FREE_TEXT_REFERENCE'] : [],
        evidence_notes: form.evidence.trim() ? form.evidence.trim() : null,

        // Narrative
        narrative: form.happened.trim(),

        // Optional contact
        contact_email: form.email.trim() ? form.email.trim() : null,
        contact_opt_in_followup: Boolean(form.email.trim()),

        // Optional note about agency (kept minimal)
        agency_note: form.agency.trim() ? form.agency.trim() : null,
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANT: omit nulls so server schemas expecting optional fields won't reject null
        body: JSON.stringify(payload, (_k, v) => (v === null ? undefined : v)),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        // Server field-level validation (preferred)
        if (json?.error === 'ValidationError' && json?.fieldErrors) {
          const nextErrors: FieldErrors = json.fieldErrors;
          setLocalErrors(nextErrors, json.message || 'Please correct the highlighted fields.');
          return;
        }

        // Fallback
        const msg =
          json?.message ||
          json?.error ||
          `Submission failed (HTTP ${res.status}). Please try again.`;
        throw new Error(msg);
      }

      // Success
      setSuccess(true);
      setReceipt(json.report_id ?? null);

      // Reset form
      setForm({
        company: '',
        agency: '',
        role: '',
        country: '',
        happened: '',
        evidence: '',
        email: '',
        consentTruthful: false,
        consentNoPII: true,
      });
      setHp('');
      setFieldErrors({});
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Submit Hiring Experience</h1>
        <p className="text-sm text-gray-300 mb-6">
          One submission = one experience. Don’t include personal data (names, phone numbers, emails
          inside the narrative).
        </p>

        {success && (
          <div className="mb-6 p-4 border border-green-500 bg-green-900/30 text-green-300 rounded">
            <div className="font-semibold">Thank you. Your experience has been submitted.</div>
            {receipt && (
              <div className="mt-2 text-sm text-green-200">
                Receipt: <span className="font-mono">{receipt}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-500 bg-red-900/30 text-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot (hidden) */}
          <div className="hidden" aria-hidden="true">
            <label className="block text-xs text-gray-400">Leave this empty</label>
            <input
              name="hp"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div ref={setFieldRef('company')}>
            <input
              name="company"
              placeholder="Company legal name (as written) *"
              value={form.company}
              onChange={handleChange}
              className={inputClass('company')}
            />
            {helpText('company')}
          </div>

          <div ref={setFieldRef('agency')}>
            <input
              name="agency"
              placeholder="Recruitment agency (optional)"
              value={form.agency}
              onChange={handleChange}
              className={inputClass('agency')}
            />
            {helpText('agency')}
          </div>

          <div ref={setFieldRef('role')}>
            <input
              name="role"
              placeholder="Role / Position *"
              value={form.role}
              onChange={handleChange}
              className={inputClass('role')}
            />
            {helpText('role')}
          </div>

          <div ref={setFieldRef('country')}>
            <input
              name="country"
              placeholder="Employer country (e.g., BG, DE) *"
              value={form.country}
              onChange={handleChange}
              className={inputClass('country')}
            />
            {helpText('country')}
          </div>

          <div ref={setFieldRef('happened')}>
            <textarea
              name="happened"
              placeholder="Describe what happened (min 50 chars) *"
              value={form.happened}
              onChange={handleChange}
              rows={7}
              className={inputClass('happened')}
            />
            {helpText('happened')}
          </div>

          <div ref={setFieldRef('evidence')}>
            <textarea
              name="evidence"
              placeholder="Evidence metadata (optional): dates, message excerpts, links (no files yet)"
              value={form.evidence}
              onChange={handleChange}
              rows={3}
              className={inputClass('evidence')}
            />
            {helpText('evidence')}
          </div>

          <div ref={setFieldRef('email')}>
            <input
              name="email"
              type="email"
              placeholder="Email for follow-up (optional)"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
            />
            {helpText('email')}
          </div>

          <div className="space-y-2 text-sm">
            <div ref={setFieldRef('consentNoPII')}>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consentNoPII"
                  checked={form.consentNoPII}
                  onChange={handleChange}
                  className={`w-4 h-4 mt-1 ${hasErr('consentNoPII') ? 'accent-red-500' : ''}`}
                />
                <span>
                  I confirm I did <b>not</b> include personal data (names, phone numbers, emails) in
                  the narrative *
                </span>
              </label>
              {helpText('consentNoPII')}
            </div>

            <div ref={setFieldRef('consentTruthful')}>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consentTruthful"
                  checked={form.consentTruthful}
                  onChange={handleChange}
                  className={`w-4 h-4 mt-1 ${hasErr('consentTruthful') ? 'accent-red-500' : ''}`}
                />
                <span>I confirm this information is truthful and submitted in good faith *</span>
              </label>
              {helpText('consentTruthful')}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </main>
  );
}
