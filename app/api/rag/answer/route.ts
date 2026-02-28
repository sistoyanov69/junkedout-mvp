import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const openai = new OpenAI();
  
  try {
    const body = (await req.json()) as {
      owner_id: string;
      question: string;
      top_k?: number;
    };

    if (!body?.owner_id) {
      return Response.json({ error: "Missing owner_id" }, { status: 400 });
    }
    if (!body?.question || !body.question.trim()) {
      return Response.json({ error: "Missing question" }, { status: 400 });
    }

    const topK = Math.min(Math.max(body.top_k ?? 5, 1), 20);

    // 1) Embed the question
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: body.question,
    });

    const queryEmbedding = emb.data[0]?.embedding;
    if (!queryEmbedding) {
      return Response.json({ error: "Failed to embed question" }, { status: 500 });
    }

    // 2) Retrieve supporting chunks (grounding)
    const { data: matches, error: matchErr } = await supabaseAdmin.rpc("rag_match_chunks", {
      p_owner_id: body.owner_id,
      p_query_embedding: queryEmbedding,
      p_match_count: topK,
    });

    if (matchErr) {
      return Response.json({ error: matchErr.message }, { status: 500 });
    }

    const results = (matches ?? []) as Array<{
      chunk_id: string;
      document_id: string;
      chunk_index: number;
      content: string;
      similarity: number;
    }>;

    if (results.length === 0) {
      return Response.json({
        ok: true,
        answer: "I don’t have enough indexed evidence to answer that question.",
        citations: [],
      });
    }

    // Build a compact context with explicit citation tags
    const context = results
      .map(
        (r, i) =>
          `[C${i + 1} | chunk_id=${r.chunk_id} | doc_id=${r.document_id} | score=${r.similarity.toFixed(
            3
          )}]\n${r.content}`
      )
      .join("\n\n");

    // 3) Generate answer with strict grounding rules
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an evidence-grounded assistant. Answer ONLY using the provided CONTEXT. " +
            "If the context is insufficient, say you don't have enough evidence. " +
            "Cite sources using the format [C1], [C2], etc. Do not invent citations.",
        },
        {
          role: "user",
          content: `QUESTION:\n${body.question}\n\nCONTEXT:\n${context}`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim() ?? "";

    return Response.json({
      ok: true,
      answer,
      citations: results.map((r, i) => ({
        label: `C${i + 1}`,
        chunk_id: r.chunk_id,
        document_id: r.document_id,
        chunk_index: r.chunk_index,
        similarity: r.similarity,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
