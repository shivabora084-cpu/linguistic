# LinguaMate AI 🌐🎙️
> **Beyond Translation. Understand Every Conversation.**

LinguaMate AI is a production-grade, full-stack multilingual conversational intelligence and voice platform. Built as one fully integrated application, every feature connects to a single central Supabase PostgreSQL database and an Express backend.

Unlike conventional translation tools that translate word-for-word out of context, LinguaMate AI understands user intentions, decodes mixed-language speech (Tanglish, Hinglish), maintains persistent conversational context across turns, asks intelligent clarification questions when intent is ambiguous, grounds answers in verified PDF documents via RAG (Retrieval-Augmented Generation), provides low-latency voice interaction, and enables escalation to human support agents.

---

## 🌟 Key Innovations

1. **Mixed-Language Intelligence (Code-Mixing)**:
   - Understands colloquial mixed-language sentences like *"Sir, admission fees evlo? Installments-la pay panlama?"* (Tamil + English) and *"Kal college jaana hai, what is the timing?"* (Hindi + English).
   - Extracts semantic intent without awkward literal translations and replies in the user's preferred language.

2. **Persistent Conversational Memory & Reference Resolution**:
   - Resolves pronouns and references across turns (e.g., Turn 1: *"What is the admission fee?"* → Turn 2: *"Can I pay it in installments?"* — correctly resolves *"it"* as the fee).

3. **Intelligent Clarification Engine**:
   - When a user request is ambiguous (e.g. *"Cancel it"* or *"Open account"*), LinguaMate AI does not make false assumptions or translate blindly; it asks a clarifying question with clickable options.

4. **Verified Document Knowledge Base (RAG)**:
   - Upload PDF and TXT guidelines. The backend extracts text, chunks it, generates embeddings with `text-embedding-004`, and performs semantic similarity search via `pgvector` to answer questions strictly citing the document name and section.

5. **Live Voice & Two-Person Translation Mode**:
   - Built on the browser Web Speech API for zero-cost, zero-latency transcription and speech synthesis.
   - Includes real-time audio waveforms, editable transcription previews, speed controls (0.75x, 1x, 1.25x), and a dual-speaker split screen for face-to-face dialogue.

6. **Human Support Escalation & Admin Analytics**:
   - Users can escalate to a human representative when automated reasoning requires human review.
   - Live operational dashboard calculates real-time metrics directly from PostgreSQL.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Frontend: React + Vite + Tailwind                 │
│                      (Deployed on Vercel / Local :5173)                │
│                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ Voice & Text │ │  Two-Person  │ │  Document    │ │     Admin     │  │
│  │ Conversation │ │ Translation  │ │  Knowledge   │ │   Analytics   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────────┘  │
│   Web Speech STT/TTS Adapter  │  Audio Waveform  │  Theme & Prefs      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS REST API (Axios + JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Backend: Node.js + Express API                      │
│                    (Deployed on Render / Local :5000)                  │
│                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ Auth & RBAC  │ │ Conversation │ │ Mixed-Lang & │ │ RAG & Storage │  │
│  │  JWT+Bcrypt  │ │ Memory Mgr   │ │ Clarification│ │ Vector Search │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────────┘  │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐        ┌────────────────────────────────┐
│       Google Gemini AI       │        │   Single Central Supabase DB   │
│   Intent, Context, Clarify,  │        │  PostgreSQL + pgvector + RLS   │
│   Translation, Summaries     │        │  Supabase Storage (PDF files)  │
└──────────────────────────────┘        └────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v26.x (recommended & Vercel deployment default) or v20.x+ LTS (local development)
- **npm**: v9.0.0 or higher
- **Engines Configuration**: Pre-configured in `package.json` and `frontend/package.json`:
  ```json
  "engines": {
    "node": "26.x"
  }
  ```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase URL/Keys and Gemini API Key
npm run dev
# Backend starts on http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

### 4. Run Automated Tests
```bash
cd backend
npm test
# Executes the 8-point automated integration verification suite
```

---

## 🗄️ Database Setup (Supabase)
Run the script located at `backend/database/schema.sql` in the **Supabase SQL Editor** to:
1. Enable `uuid-ossp`, `pgcrypto`, and `vector` extensions.
2. Create all 12 tables: `profiles`, `user_preferences`, `conversations`, `messages`, `conversation_summaries`, `knowledge_documents`, `knowledge_chunks`, `feedback`, `escalations`, `support_agents`, `analytics_events`, `audit_logs`.
3. Create the `linguamate-files` Supabase Storage bucket.
4. Create the `match_knowledge_chunks` RPC function for cosine similarity search.

---

## ☁️ Deployment

### 1. Frontend Deployment (Vercel)

The repository is fully configured for seamless deployment on Vercel with **Node.js 26.x**.

#### Recommended Deployment Flow (Root Directory: `frontend`):
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Select your `linguistic` repository.
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build` (or leave default `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://<your-render-backend>.onrender.com/api`
5. Under **Settings** → **General** → **Node.js Version**, confirm it is set to **26.x**.
6. Click **Deploy**.

#### Alternative Monorepo Deployment (Root Directory: `./`):
If importing from the repository root, the included root [`vercel.json`](./vercel.json) automatically orchestrates the frontend build:
```json
{
  "installCommand": "cd frontend && npm install",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 2. Backend Deployment (Render)
- **Root directory**: `backend`
- **Environment**: `Node`
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Health check path**: `/api/health`
- **Environment variables**:
  - `PORT`: `5000` (or `10000` per Render default)
  - `NODE_ENV`: `production`
  - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app` (or `*`)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`, `AI_MODEL`: `gemini-3.5-flash-lite`
  - `JWT_SECRET`: Random 32+ character string

---

## 🛠️ Vercel Troubleshooting & Prevention Guide

### Issue 1: `Node.js Version "20.x" is discontinued and must be upgraded`
- **Cause**: Vercel has discontinued support for Node.js 20.x in new build images and mandates Node.js 26.x.
- **Prevention & Resolution**:
  1. Both root [`package.json`](./package.json) and [`frontend/package.json`](./frontend/package.json) include:
     ```json
     "engines": {
       "node": "26.x"
     }
     ```
  2. Both root [`.nvmrc`](./.nvmrc), [`.node-version`](./.node-version), and `frontend/` counterparts pin the runtime to `26`.
  3. In the Vercel Dashboard, navigate to **Project Settings** → **General** → **Node.js Version** and ensure **26.x** is selected.
  4. Both `package-lock.json` manifests have all outdated `20.x` constraints removed.

### Issue 2: `404 Not Found` on Page Refresh (e.g. `/translate`, `/two-person`, `/history`)
- **Cause**: In single-page applications (SPAs), direct navigation to subpaths fails if the host does not route requests to `/index.html`.
- **Prevention & Resolution**: Both [`vercel.json`](./vercel.json) and [`frontend/vercel.json`](./frontend/vercel.json) include rewrite rules:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

### Issue 3: `Network Error` or CORS Block on Frontend API Calls
- **Cause**: Missing or incorrect backend API URL or mismatched CORS headers.
- **Prevention & Resolution**:
  - In Vercel Project Settings → Environment Variables, verify `VITE_API_BASE_URL` is set to `https://<your-backend-app>.onrender.com/api`.
  - In Render Dashboard, ensure `FRONTEND_URL` matches your deployed Vercel domain (e.g. `https://linguamate-ai.vercel.app`) or is set to `*`.

### Issue 4: Stale Build Cache in Vercel
- **Cause**: Vercel may reuse cached build steps from previous failed deployments.
- **Resolution**:
  - Go to **Deployments** in Vercel.
  - Click the **...** (three dots) menu next to the latest commit.
  - Select **Redeploy** and check the box **"Redeploy with existing build cache cleared"**.

---

## 📜 7 Hackathon Demonstration Scenarios

1. **Multilingual & Mixed-Language Understanding**:
   - Query: *"Sir, admission fees evlo? Installments-la pay panlama?"*
   - AI detects Tanglish, decodes the admission and installment inquiry, and responds fluently in Tamil.
2. **Contextual Memory**:
   - Turn 1: *"What is the admission fee?"* → Turn 2: *"Can I pay it in installments?"*
   - AI resolves *"it"* as referring to the admission fee.
3. **Intelligent Clarification**:
   - Query: *"Cancel it."*
   - AI detects missing information and asks: *"Which service or request would you like to cancel?"* with quick selection options.
4. **Document Knowledge Base (RAG)**:
   - Upload admission PDF → Ask: *"What documents are required for admission?"* in Tamil.
   - AI retrieves relevant vector chunks and replies with verified citations.
5. **Natural Spoken Response**:
   - Listen to spoken replies, toggle 0.75x slow-down, repeat with one click.
6. **Human Support Escalation**:
   - Click *"Escalate"* to queue an escalation ticket for a human representative with full conversation context.
7. **Admin Operational Dashboard**:
   - View live PostgreSQL counts of users, conversations, messages, language distribution, and system health.
