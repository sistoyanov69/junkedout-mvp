"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

type Citation = {
  label: string;
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  similarity: number;
};

export default function RagTestPage() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [question, setQuestion] = useState("What is this document for?");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setError("You must be logged in to use this page.");
        return;
      }
      setOwnerId(data.user.id);
    });
  }, []);

  async function onAsk() {
    if (!ownerId) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setCitations([]);

    try {
      const res = await fetch("/api/rag/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: ownerId,
          question: question.trim(),
          top_k: 5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      setAnswer(data?.answer ?? "");
      setCitations(data?.citations ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">RAG Test Console</h1>

        {!ownerId ? (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-3">
            Waiting for authenticated user…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Question</label>
              <textarea
                className="w-full min-h-[120px] rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your indexed evidence..."
              />
            </div>

            <button
              onClick={onAsk}
              disabled={loading}
              className="rounded-md bg-white text-black px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </>
        )}

        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3">
            <div className="font-semibold">Error</div>
            <div className="text-sm text-white/80">{error}</div>
          </div>
        ) : null}

        {answer ? (
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 space-y-3">
            <div className="font-semibold">Answer</div>
            <div className="text-white/90 whitespace-pre-wrap">{answer}</div>

            <div className="pt-2 border-t border-white/10">
              <div className="font-semibold mb-2">Citations</div>
              <ul className="space-y-2 text-sm text-white/80">
                {citations.map((c) => (
                  <li key={c.label} className="rounded bg-black/30 p-2 border border-white/10">
                    <div>
                      <span className="font-semibold">{c.label}</span>{" "}
                      <span className="text-white/60">
                        (score {Number(c.similarity).toFixed(3)})
                      </span>
                    </div>
                    <div className="text-white/60 break-all">chunk_id: {c.chunk_id}</div>
                    <div className="text-white/60 break-all">doc_id: {c.document_id}</div>
                    <div className="text-white/60">chunk_index: {c.chunk_index}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
