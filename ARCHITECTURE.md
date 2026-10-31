# LinguaMate AI - System Architecture Document

## Overview
LinguaMate AI is built on a decoupled, production-ready client-server architecture powered by a single central Supabase PostgreSQL database and Google Gemini AI.

---

## 1. System Topology

```
[ Web Browser ]
      │
      ├─► [ React + Vite + Tailwind Frontend (Vercel) ]
      │         │
      │         ├─► Web Speech API (Browser STT & TTS)
      │         └─► Axios HTTP Client (Bearer JWT)
      │                   │
      └───────────────────┼────────────────────────────────────────┐
                          ▼                                        ▼
             [ Node.js + Express Backend API (Render) ]    [ Supabase Storage ]
                          │                              (PDF Files / Bucket)
           ┌──────────────┴──────────────┐
           ▼                             ▼
  [ Google Gemini API ]     [ Central Supabase PostgreSQL ]
  - Intent Detection         - 12 Relational Tables
  - Context Reasoning        - pgvector Extension (vector(768))
  - Clarification Logic      - Row-Level Security
  - Translation Engine       - Full-text & Similarity Search
  - Text Embeddings
```

---

## 2. Component Breakdown

### Frontend (`frontend/`)
- **Technology**: React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, Axios.
- **State Management**:
  - `AuthContext`: Manages JWT tokens, user profiles, auto-login, and authorization states.
  - `ThemeContext`: Handles light/dark themes with HTML class manipulation and localStorage persistence.
  - `VoiceContext`: Manages Web Speech recognition and speech synthesis lifecycle, rates (0.75x, 1x, 1.25x), voice lists, and recording states.
- **Security**: Never exposes private Gemini API keys or database passwords. All requests pass through `/api/*`.

### Backend (`backend/`)
- **Technology**: Node.js 18+, Express, Helmet, CORS, Multer, Zod, JWT, bcryptjs, pdf-parse, `@google/generative-ai`, `@supabase/supabase-js`.
- **Modular Directory Structure**:
  - `config/`: Environment configuration, status validator, safe fallbacks.
  - `controllers/`: Request handling for Auth, Chat, Conversations, Translation, Speech, Knowledge, Escalation, Feedback, and Admin.
  - `database/`: Supabase client singleton, connection health check, and SQL schema migrations.
  - `middleware/`: JWT verification, role-based access control (`requireRole`, `requireAdmin`), Zod request validation, and central error handling.
  - `routes/`: REST endpoint routing.
  - `services/`:
    - `geminiService.js`: Intent detection, multi-turn context generation, clarification prompts, cultural translation, summarization, and vector embeddings.
    - `ragService.js`: PDF text extraction, semantic chunking with overlap, embedding generation, and cosine similarity retrieval.
    - `speechAdapter.js`: Provider abstraction for speech services.
  - `validators/`: Zod schemas enforcing strict request payload validation.

### Central Database (`backend/database/schema.sql`)
- **Database**: Single Supabase PostgreSQL project.
- **Vector Search**: PostgreSQL `pgvector` extension with IVFFlat index on `knowledge_chunks.embedding vector(768)` for cosine similarity search.
- **Storage**: Supabase Storage bucket `linguamate-files` for uploaded PDF documents.
