# LinguaMate AI - Database Schema Documentation

All modules connect to one central Supabase PostgreSQL project.

---

## Tables Overview

| Table | Description | Primary Key | Foreign Keys |
| :--- | :--- | :--- | :--- |
| `profiles` | User accounts, credentials, and roles | `id` (UUID) | - |
| `user_preferences` | Audio rates, voice selection, themes | `id` (UUID) | `user_id` -> `profiles.id` |
| `conversations` | Conversation threads and titles | `id` (UUID) | `user_id` -> `profiles.id` |
| `messages` | Chat messages with sentiment, language, and intent | `id` (UUID) | `conversation_id` -> `conversations.id` |
| `conversation_summaries`| Compressed summaries of older conversation turns | `id` (UUID) | `conversation_id` -> `conversations.id` |
| `knowledge_documents` | Uploaded PDF and TXT metadata and status | `id` (UUID) | `user_id` -> `profiles.id` |
| `knowledge_chunks` | Semantic text chunks with vector embeddings (768d) | `id` (UUID) | `document_id` -> `knowledge_documents.id` |
| `feedback` | User star ratings and message comments | `id` (UUID) | `conversation_id`, `message_id`, `user_id` |
| `escalations` | Human representative handoff tickets | `id` (UUID) | `conversation_id`, `user_id`, `assigned_agent_id` |
| `support_agents` | Support representative profiles | `id` (UUID) | `user_id` -> `profiles.id` |
| `analytics_events` | Granular event logging (latencies, languages, intents)| `id` (UUID) | `user_id` -> `profiles.id` |
| `audit_logs` | Admin and security audit trail | `id` (UUID) | `user_id` -> `profiles.id` |

---

## Vector Search Function (RPC)

```sql
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INT,
  content TEXT,
  similarity float,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.chunk_index,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata
  FROM knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Storage Bucket
- Bucket Name: `linguamate-files`
- Public access: Enabled for document preview/downloads.
- Security: Uploads restricted to authenticated users.
