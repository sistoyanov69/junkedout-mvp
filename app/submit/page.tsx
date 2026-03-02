'use client';

import { useMemo, useRef, useState } from 'react';

type EmployerIdType = '' | 'VAT' | 'REG_NUMBER' | 'LEI' | 'DUNS' | 'OTHER';

type FormState = {
  company: string;
  agency: string;
  role: string;

  // strict ISO 3166-1 alpha-2
  country: string;

  // optional but structured identifier
  employerIdType: EmployerIdType;
  employerIdValue: string;

  happened: string;
  evidence: string;
  email: string;

  consentTruthful: boolean;
  consentNoPII: boolean;
};

type FieldErrors = Record<string, string[]>;

// EU27 + EEA + UK + CH (good “Europe v0” coverage)
const COUNTRY_OPTIONS: Array<{ code: string; name: string }> = [
  // EU27
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },

  // EEA (non-EU)
  { code: 'IS', name: 'Iceland' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'NO', name: 'Norway' },

  // Others (Europe v0)
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CH', name: 'Switzerland' },
];

const EMPLOYER_ID_TYPES: Array<{ value: EmployerIdType; label: string; hint: string }> = [
  { value: '', label: 'None (not provided)', hint: '' },
  { value: 'VAT', label: 'VAT number', hint: 'EU VAT ID (best for EU-wide verification later)' },
  {
    value: 'REG_NUMBER',
    label: 'National registration number',
    hint: 'Company register / trade register number',
  },
  { value: 'LEI', label: 'LEI', hint: 'Legal Entity Identifier (20 chars, global)' },
  { value: 'DUNS', label: 'D-U-N-S', hint: 'Dun & Bradstreet identifier' },
  { value: 'OTHER', label: 'Other', hint: 'Any other identifier you can provide' },
];

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>({
    company: '',
    agency: '',
    role: '',
    country: '',

    employerIdType: '',
    employerIdValue: '',

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
      'employerIdType',
      'employerIdValue',
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
      <div className="mt-2 text-sm text-red-300 space-y-1">
        {msgs.map((m, idx) => (
          <div key={`${name}-${idx}`}>{m}</div>
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear field errors as user edits
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

    if (!form.company.trim()) errs.company = ['Company legal name is required.'];
    if (!form.role.trim()) errs.role = ['Role / Position is required.'];

    if (!form.country.trim()) errs.country = ['Country is required.'];
    if (form.country.trim() && form.country.trim().length !== 2)
      errs.country = ['Invalid country code.'];

    // If type is set, value must be set
    if (form.employerIdType && !form.employerIdValue.trim()) {
      errs.employerIdValue = ['Identifier value is required when identifier type is selected.'];
    }

    if ((form.happened || '').trim().length < 50)
      errs.happened = ['Description must be at least 50 characters.'];

    if (!form.consentNoPII)
      errs.consentNoPII = ['You must confirm you did not include personal data in the narrative.'];
    if (!form.consentTruthful) errs.consentTruthful = ['You must confirm good-faith submission.'];

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = ['Email is not valid (example: name@domain.com).'];
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setReceipt(null);

    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length) {
      setLocalErrors(clientErrs, 'Please correct the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        schema_version: 'report.v0' as const,

        consent_terms: form.consentTruthful,
        consent_no_pii: form.consentNoPII,
        consent_followup: Boolean(form.email.trim()),

        hp,

        // employer identity (strict country + optional id)
        employer_country: form.country.trim(),
        employer_legal_name: form.company.trim(),
        employer_identifier_type: form.employerIdType ? form.employerIdType : null,
        employer_identifier_value: form.employerIdValue.trim() ? form.employerIdValue.trim() : null,

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
        // omit nulls
        body: JSON.stringify(payload, (_k, v) => (v === null ? undefined : v)),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        if (json?.error === 'ValidationError' && json?.fieldErrors) {
          const nextErrors: FieldErrors = json.fieldErrors;
          setLocalErrors(nextErrors, json.message || 'Please correct the highlighted fields.');
          return;
        }

        const msg =
          json?.message ||
          json?.error ||
          `Submission failed (HTTP ${res.status}). Please try again.`;
        throw new Error(msg);
      }

      setSuccess(true);
      setReceipt(json.report_id ?? null);

      setForm({
        company: '',
        agency: '',
        role: '',
        country: '',
        employerIdType: '',
        employerIdValue: '',
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

  const selectedIdTypeHint =
    EMPLOYER_ID_TYPES.find((t) => t.value === form.employerIdType)?.hint ?? '';

  return (
    <main className="min-h-screen bg-black text-white flex justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Submit Hiring Experience</h1>
        <p className="text-gray-300 mb-6">
          One submission = one experience. Don’t include personal data (names, phone numbers, emails
          inside the narrative).
        </p>

        {success && (
          <div className="mb-6 p-4 rounded bg-green-900/30 border border-green-600">
            <div className="font-semibold">Thank you. Your experience has been submitted.</div>
            {receipt && <div className="mt-2 text-sm text-green-200">Receipt: {receipt}</div>}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded bg-red-900/30 border border-red-600">
            <div className="text-red-200">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot (hidden) */}
          <div className="hidden">
            <input
              name="hp"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              autoComplete="off"
              aria-label="Leave this empty"
            />
          </div>

          <div ref={setFieldRef('company')}>
            <input
              name="company"
              placeholder="Company legal name *"
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
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass('country')}
            >
              <option value="">Select employer country *</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            {helpText('country')}
          </div>

          <div className="rounded border border-gray-800 p-4 bg-gray-950/40 space-y-3">
            <div className="text-sm text-gray-300">
              Employer identifier (optional, but strongly recommended for verification later)
            </div>

            <div ref={setFieldRef('employerIdType')}>
              <select
                name="employerIdType"
                value={form.employerIdType}
                onChange={handleChange}
                className={inputClass('employerIdType')}
              >
                {EMPLOYER_ID_TYPES.map((t) => (
                  <option key={t.value || '__none'} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {helpText('employerIdType')}
              {selectedIdTypeHint ? (
                <div className="mt-2 text-xs text-gray-400">{selectedIdTypeHint}</div>
              ) : null}
            </div>

            <div ref={setFieldRef('employerIdValue')}>
              <input
                name="employerIdValue"
                placeholder="Identifier value (e.g., VAT / registration number)"
                value={form.employerIdValue}
                onChange={handleChange}
                className={inputClass('employerIdValue')}
                disabled={!form.employerIdType}
              />
              {helpText('employerIdValue')}
            </div>
          </div>

          <div ref={setFieldRef('happened')}>
            <textarea
              name="happened"
              placeholder="Describe what happened (min 50 chars) *"
              value={form.happened}
              onChange={handleChange}
              rows={6}
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
