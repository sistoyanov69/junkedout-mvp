import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const openai = new OpenAI(); // uses OPENAI_API_KEY from env :contentReference[oaicite:2]{index=2}

// Simple, deterministic chunking (MVP): fixed char window + overlap.
function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const slice = clean.slice(start, end);

    // try not to cut mid-word (best-effort)
    const adjusted =
      end < clean.length
        ? slice.replace(/\s+\S*$/, "") || slice
        : slice;

    chunks.push(adjusted.trim());
    if (end === clean.length) break;

    start = Math.max(0, end - overlap);
  }

  return chunks.filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      owner_id: string; // auth.users.id (uuid)
      title?: string;
      source?: string; // "user_upload" | "policy" | ...
      text: string;
      consent_indexing: boolean;
      original_url?: string;
      content_type?: string;
    };

    if (!body?.owner_id) {
      return Response.json({ error: "Missing owner_id" }, { status: 400 });
    }
    if (!body?.consent_indexing) {
      return Response.json({ error: "consent_indexing must be true" }, { status: 400 });
    }
    if (!body?.text?.trim()) {
      return Response.json({ error: "Missing text" }, { status: 400 });
    }

    // 1) Create document
    const { data: doc, error: docErr } = await supabaseAdmin
      .from("rag_documents")
      .insert({
        owner_id: body.owner_id,
        source: body.source ?? "user_upload",
        title: body.title ?? null,
        original_url: body.original_url ?? null,
        content_type: body.content_type ?? "text/plain",
        consent_indexing: true,
      })
      .select("id")
      .single();

    if (docErr || !doc) {
      return Response.json({ error: docErr?.message ?? "Doc insert failed" }, { status: 500 });
    }

    // 2) Chunk
    const chunks = chunkText(body.text);
    if (chunks.length === 0) {
      return Response.json({ error: "No chunks produced" }, { status: 400 });
    }

    // 3) Insert chunks
    const chunkRows = chunks.map((content, idx) => ({
      document_id: doc.id,
      chunk_index: idx,
      content,
      metadata: {},
    }));

    const { data: insertedChunks, error: chunkErr } = await supabaseAdmin
      .from("rag_chunks")
      .insert(chunkRows)
      .select("id, chunk_index");

    if (chunkErr || !insertedChunks?.length) {
      return Response.json({ error: chunkErr?.message ?? "Chunk insert failed" }, { status: 500 });
    }

    // 4) Embed in batches, then insert embeddings
    // Use text-embedding-3-small which matches vector(1536). :contentReference[oaicite:3]{index=3}
    const byIndex = new Map(insertedChunks.map((c) => [c.chunk_index, c.id]));

    const batchSize = 64;
    const embeddingsToInsert: Array<{ chunk_id: string; embedding: number[] }> = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
      });

      // emb.data is in the same order as input
      emb.data.forEach((item, j) => {
        const chunkIndex = i + j;
        const chunkId = byIndex.get(chunkIndex);
        if (!chunkId) return;
        embeddingsToInsert.push({ chunk_id: chunkId, embedding: item.embedding });
      });
    }

    const { error: embErr } = await supabaseAdmin
      .from("rag_embeddings")
      .insert(embeddingsToInsert);

    if (embErr) {
      return Response.json({ error: embErr.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      document_id: doc.id,
      chunks: chunks.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
