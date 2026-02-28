# JunkedOut – AI Architecture (Trustworthy AI by Design)

## Purpose

JunkedOut uses artificial intelligence strictly as an evidence-grounded assistance layer, not as an automated decision-maker. The platform is designed to document, analyze, and explain hiring-related experiences provided by users, while preserving human oversight, accountability, and user control. This document describes the technical architecture and safeguards that ensure JunkedOut’s AI remains explainable, auditable, privacy-respecting, and resistant to hallucination or opaque decision-making.

## Core Principle: No Evidence, No Answer

JunkedOut does not allow AI models to generate free-form answers based on general knowledge alone. Every AI-generated response must be grounded in user-authorized, stored evidence. If the system cannot retrieve sufficient evidence, it must explicitly state that it cannot answer.

This principle is enforced technically, not by policy alone.

## Architecture Overview (Retrieval-Augmented Generation)

JunkedOut implements a Retrieval-Augmented Generation (RAG) architecture consisting of three strictly separated stages:

1. Ingestion (Evidence Indexing)
2. Retrieval (Evidence Selection)
3. Generation (Grounded Explanation with Citations)

At no point does the system bypass retrieval to produce an answer.

## 1. Evidence Ingestion

### User Control and Consent

Users submit documents (e.g., rejection emails, timelines, policy excerpts) voluntarily.

Each document is indexed only after explicit consent is provided for AI processing.

Consent status is stored alongside the document metadata.

### Processing

Submitted text is stored as a document record.

Documents are split into small, ordered text chunks.

Each chunk is converted into a numerical embedding (vector representation).

Chunks and embeddings are stored in a PostgreSQL database using pgvector.

### Data Ownership

Every document, chunk, and embedding is linked to a specific user account (auth.users.id).

Deleting a document cascades and removes all derived chunks and embeddings.

## 2. Evidence Retrieval

### Query Handling

When a user asks a question, the question itself is embedded using the same embedding model as the stored chunks.

A vector similarity search (cosine distance) retrieves the most semantically relevant chunks.

### Access Control

Retrieval is strictly owner-scoped.

Only chunks belonging to the requesting user can be retrieved.

Cross-user access is technically impossible due to row-level security and query filtering.

### Determinism

Retrieval is deterministic and inspectable.

The system knows exactly which chunks were selected.

Similarity scores are preserved for traceability.

## 3. Grounded Generation with Citations

### Context Construction

Retrieved chunks are assembled into a bounded context.

Each chunk is labeled with an internal citation identifier (e.g., [C1], [C2]).

### Strict Prompting Rules

The language model is instructed to:

- Answer only using the provided context.
- Explicitly cite claims using the provided citation identifiers.
- Refuse to answer if the context is insufficient.
- Never invent facts, sources, or interpretations beyond the evidence.

### Output

Each response includes:

- A natural-language answer.
- A list of citations mapping directly to stored chunk IDs.
- Traceability from answer → chunk → document → user submission.

## What the System Does Not Do

JunkedOut’s AI explicitly does not:

- Make hiring decisions.
- Rank or score individuals.
- Predict employability or suitability.
- Infer protected characteristics.
- Operate without human-readable evidence.
- Hide or obscure the source of its conclusions.

The AI assists with explanation and summarization, not judgment.

## Privacy and Compliance Considerations

- Data minimization: only user-submitted content is processed.
- Purpose limitation: embeddings are used solely for retrieval within the platform.
- User rights: data can be deleted, which removes all derived AI artifacts.
- No model training: user data is not used to train foundation models.
- Explainability by design: every answer is traceable to source text.

This architecture aligns with GDPR principles and EU expectations around explainable, non-automated decision support systems.

## Summary

JunkedOut’s AI architecture is deliberately conservative. It prioritizes:

- Evidence over inference
- Transparency over automation
- User control over efficiency

By enforcing Retrieval-Augmented Generation with strict ownership, consent, and citation rules, JunkedOut ensures that AI remains a tool for accountability, not an opaque authority.
