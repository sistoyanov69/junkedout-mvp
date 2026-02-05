"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [form, setForm] = useState({
    company: "",
    agency: "",
    role: "",
    country: "",
    happened: "",
    evidence: "",
    email: "",
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    // Basic client-side validation
    if (
      !form.company ||
      !form.role ||
      !form.country ||
      form.happened.length < 50 ||
      !form.consent
    ) {
      setError("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: form.company,
          agency: form.agency || null,
          role: form.role,
          country: form.country,
          happened: form.happened,
          evidence: form.evidence || null,
          contact_email: form.email || null,
          consent: form.consent,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json?.error || "Submission failed");
      }

      // Reset form
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

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Submission error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        <h1 className="text-3xl font-bold mb-6">
          Submit Hiring Experience
        </h1>

        {success && (
          <div className="mb-6 p-4 border border-green-500 bg-green-900/30 text-green-300 rounded">
            Thank you. Your experience has been submitted.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-500 bg-red-900/30 text-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="company"
            placeholder="Company name *"
            value={form.company}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            name="agency"
            placeholder="Recruitment agency (optional)"
            value={form.agency}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            name="role"
            placeholder="Role / Position *"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            name="country"
            placeholder="Country *"
            value={form.country}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <textarea
            name="happened"
            placeholder="Describe what happened (min 50 chars) *"
            value={form.happened}
            onChange={handleChange}
            rows={6}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <textarea
            name="evidence"
            placeholder="Evidence / dates / references (optional)"
            value={form.evidence}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              className="w-4 h-4"
            />
            I confirm this information is truthful and submitted in good faith *
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

        </form>
      </div>
    </main>
  );
}
