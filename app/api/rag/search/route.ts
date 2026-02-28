import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const openai = new OpenAI();

type RagMatchRow = {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      owner_id: string;
      query: string;
      top_k?: number;
    };

    if (!body?.owner_id) {
      return Response.json({ error: "Missing owner_id" }, { status: 400 });
    }

    if (!body?.query || !body.query.trim()) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }

    const topK = Math.min(Math.max(body.top_k ?? 5, 1), 20);

    // 1) Embed the query (MUST match stored embedding dimension: 1536)
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: body.query,
    });

    const queryEmbedding = embeddingResponse.data[0]?.embedding;
    if (!queryEmbedding) {
      return Response.json(
        { error: "Failed to create query embedding" },
        { status: 500 }
      );
    }

    // 2) Vector similarity search via RPC
    const { data, error } = await supabaseAdmin.rpc("rag_match_chunks", {
      p_owner_id: body.owner_id,
      p_query_embedding: queryEmbedding,
      p_match_count: topK,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as RagMatchRow[];

    return Response.json({
      ok: true,
      results: rows.map((r) => ({
        chunk_id: r.chunk_id,
        document_id: r.document_id,
        chunk_index: r.chunk_index,
        similarity: r.similarity,
        content: r.content,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
