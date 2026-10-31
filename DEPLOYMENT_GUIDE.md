# LinguaMate AI — Production Deployment Guide

This guide covers deploying the backend to **Render** and the frontend to **Netlify** (or **Vercel**), with zero-DB resilience and full environment configuration.

---

## Architecture Overview

```
   ┌───────────────────────────────┐
   │    Frontend (Vite + React)    │
   │  Deployed on Netlify / Vercel │
   └───────────────┬───────────────┘
                   │ HTTPS API calls
                   ▼
   ┌───────────────────────────────┐
   │      Backend (Node 20 LTS)    │
   │      Deployed on Render       │
   └───────────────┬───────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│ Google Gemini AI │ │ Supabase DB      │
│ (Cascading API)  │ │ (Optional Zero-  │
└──────────────────┘ │  DB Fallback)    │
                     └──────────────────┘
```

---

## 1. Backend Deployment (Render)

### Step 1: Connect GitHub Repository
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select and connect your LinguaMate AI GitHub repository.

### Step 2: Configure Service Settings
- **Name**: `linguamate-backend` (or any preferred name)
- **Region**: Closest to your users (e.g. Frankfurt, Oregon, Singapore)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Instance Type**: `Free` or `Starter`

### Step 3: Add Environment Variables
In the **Environment** tab, add the following key-value pairs:

| Variable | Recommended Value | Note |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enforces production mode |
| `PORT` | `10000` | Render assigns port dynamically, backend respects `process.env.PORT` |
| `GEMINI_API_KEY` | `AQ.Ab8RN6JTx...` | Your active Google Gemini API key |
| `AI_MODEL` | `gemini-3.5-flash-lite` | Primary fast model (with auto-fallback to 3.5-flash & 2.5-flash) |
| `JWT_SECRET` | *(Random 32+ char string)* | Secure token signing key (e.g. `linguamate-prod-secret-984716298471928471`) |
| `JWT_EXPIRES_IN` | `7d` | Token expiration window |
| `FRONTEND_URL` | `https://your-app.netlify.app` | Your deployed frontend domain (for CORS) |
| `STT_PROVIDER` | `browser` | Zero-latency client-side Web Speech API |
| `TTS_PROVIDER` | `browser` | Zero-latency client-side speech synthesis |
| `SUPABASE_URL` | *(Optional)* | Only if using Supabase; omit for in-memory zero-DB mode |
| `SUPABASE_ANON_KEY` | *(Optional)* | Only if using Supabase; omit for in-memory zero-DB mode |
| `SUPABASE_SERVICE_ROLE_KEY`| *(Optional)* | Only if using Supabase; omit for in-memory zero-DB mode |

> [!NOTE]
> **Zero-DB Resiliency**: If Supabase credentials are not provided, LinguaMate AI automatically switches to its in-memory zero-DB mode. User authentication, conversations, document translation, and caching operate without any database connection.

### Step 4: Deploy & Verify
1. Click **Create Web Service**.
2. Once the build finishes, verify by opening your public health endpoint:
   `https://<your-render-app-name>.onrender.com/api/health`
   You should receive `{ "status": "healthy", "model": "gemini-3.5-flash-lite", ... }`.

---

## 2. Frontend Deployment (Netlify)

### Step 1: Connect GitHub Repository
1. Log into your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Authorize GitHub and select the repository.

### Step 2: Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### Step 3: Configure Environment Variables
Under **Site configuration** → **Environment variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://<your-render-app-name>.onrender.com/api` |

### Step 4: SPA Routing Redirects
The project includes a `frontend/public/_redirects` file:
```
/*    /index.html   200
```
This ensures React Router routes (such as `/translate`, `/two-person`, `/live-voice`) reload properly without 404 errors.

### Step 5: Deploy
Click **Deploy site**. Once deployed, copy your Netlify URL (e.g., `https://linguamate-ai.netlify.app`) and update the `FRONTEND_URL` environment variable on Render to grant CORS access.

---

## 3. Alternative Frontend Deployment (Vercel)

If deploying to Vercel instead of Netlify:
1. Log into [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import the repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://<your-render-app-name>.onrender.com/api`
5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

1. [ ] **Health Endpoint**: `https://<backend-domain>/api/health` returns status `healthy` or `partially_configured`.
2. [ ] **Capabilities Endpoint**: `https://<backend-domain>/api/speech/capabilities` returns all 16 supported languages.
3. [ ] **CORS Verification**: Frontend makes requests to backend without `Access-Control-Allow-Origin` errors.
4. [ ] **Translation & Cache**: Test a translation on the live frontend; verify the second identical request returns instantly with the `⚡ Instant Cache` badge.
5. [ ] **Live Voice**: Open `/live-voice` on HTTPS; allow microphone access and confirm STT/TTS work in your browser.
6. [ ] **Document Translation**: Upload a PDF or TXT document on `/knowledge` and verify translated preview and download.
