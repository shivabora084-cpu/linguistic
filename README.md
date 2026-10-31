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

### 4. Mobile App Setup (React Native + Expo)
```bash
cd mobile
npm install
# Set the backend URL in .env or EXPO_PUBLIC_API_BASE_URL (defaults to http://localhost:5000/api)
npm start
# Press 'a' to open on Android Emulator, or scan QR code with Expo Go on physical device
```

### 5. Run Automated Tests
```bash
# Backend 8-point automated integration verification
cd backend
npm test

# Super Fast Mode specific verification
npm run test:fast

# Mobile application verification suite (19 tests)
node ../mobile/test/mobile.test.mjs
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

### 2. Fullstack & Backend Deployment (Render)

Render can deploy LinguaMate AI in multiple configurations:

#### Option A: Unified Fullstack Web Service (Recommended on Render)
Builds and serves both the React Vite frontend and the Express Node.js API from a single Render Web Service:
- **Repository**: `https://github.com/shivabora084-cpu/linguistic`
- **Root Directory**: `.` (leave blank or `./`)
- **Environment**: `Node`
- **Build Command**: `npm run build`
  *(Automatically executes `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`)*
- **Start Command**: `npm start`
  *(Runs `node backend/src/server.js`, which serves both `/api/*` endpoints and the static frontend from `frontend/dist`)*
- **Health Check Path**: `/api/health`

#### Option B: Standalone Backend API on Render (Frontend on Vercel)
If you deploy your frontend separately to Vercel, deploy just the backend API on Render:
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

#### Option C: Standalone Frontend on Render (Static Site)
If deploying the frontend as a Render Static Site:
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Routes / Rewrites**: Add rewrite rule `/*` → `/index.html`

#### Required Environment Variables (Render Web Service):
| Variable | Value / Description | Note |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Auto-provided by Render |
| `FRONTEND_URL` | `*` (or your Vercel URL) | CORS allow list |
| `GEMINI_API_KEY` | `AQ.Ab8RN6JTx...` | Google Gemini API Key |
| `AI_MODEL` | `gemini-3.5-flash-lite` | Primary fast model |
| `JWT_SECRET` | *(Random 32+ characters)* | Token encryption secret |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `SUPABASE_URL` | `https://fhwzwdmxnwtjokvxlvzd.supabase.co` | Supabase endpoint |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase Service Role Key |
| `STORAGE_BUCKET` | `linguamate-files` | Storage bucket name |
| `STT_PROVIDER` | `browser` | Zero-latency Web Speech |
| `TTS_PROVIDER` | `browser` | Zero-latency Web Speech |

---

## 🛠️ Render Troubleshooting Guide: Fixing `sh: 1: vite: not found`

### 1. Root Cause Analysis
The error:
```bash
> linguamate-frontend@1.0.0 build
> vite build
sh: 1: vite: not found
==> Build failed
```
occurs when Render executes `vite build` without `vite` being present in `node_modules/.bin`. This happens due to two specific factors:
1. **Missing Directory-Level Dependencies**: When deploying from the repository root, Render runs `npm install` in the root folder, leaving `frontend/node_modules` uninstalled unless explicit prefix commands are chained.
2. **`NODE_ENV=production` devDependency Pruning**: In production environments, `npm install` skips packages listed under `devDependencies`. Because `vite` was previously in `devDependencies`, Render pruned it during installation.

### 2. How This Issue Is Resolved In This Repository:
1. **`vite` Moved to `dependencies`**: In [`frontend/package.json`](./frontend/package.json), `vite` and all frontend build tooling (`@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`) are declared in `"dependencies"` so npm never skips them when `NODE_ENV=production`.
2. **Self-Installing Root Build Command**: The root [`package.json`](./package.json) `"build"` script is updated to:
   ```json
   "build": "npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend"
   ```
   This guarantees that both backend and frontend packages are guaranteed to install before `vite build` runs.
3. **Automated Blueprint Support**: [`render.yaml`](./render.yaml) is configured with `buildCommand: npm run build` and `startCommand: npm start`.

### 3. Step-by-Step Fix in Render Dashboard:
If you have an existing Web Service on Render that failed with `vite: not found`:
1. Open your Web Service in the [Render Dashboard](https://dashboard.render.com/).
2. Go to **Settings**.
3. Verify your configuration:
   - **Root Directory**: `.` (leave blank or clear it)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Click **Save Changes**.
5. Click **Manual Deploy** → **Clear build cache & deploy**.

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
