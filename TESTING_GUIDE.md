# LinguaMate AI — Complete Testing Guide

This testing guide provides comprehensive automated and manual verification procedures for all frontend and backend capabilities of LinguaMate AI.

---

## 1. Automated Test Suites

The backend includes two dedicated test suites covering integration endpoints, AI resilience, caching, smart tools, and zero-DB persistence.

### 1.1 Ultimate Upgrade Test Suite (12 Tests)
Verifies all newly upgraded architecture, cache layer, 10 translation modes, 16 speech capabilities, and smart tools.

```bash
cd backend
node test/ultimate_upgrade.test.js
```

**Test Coverage**:
1. `GET /api/health` — Confirms active Gemini cascade model and status (`healthy` or `partially_configured` in zero-DB mode).
2. `GET /api/speech/capabilities` — Validates support for all 16 languages (`en`, `hi`, `ta`, `te`, `ml`, `kn`, `bn`, `mr`, `gu`, `pa`, `es`, `fr`, `de`, `ar`, `ja`, `zh`).
3. `POST /api/translation/translate` (`mode=academic`) — Validates multi-mode translation processing.
4. `POST /api/translation/translate` (Cache Hit) — Confirms sub-200ms latency on repeated identical translation queries.
5. `GET /api/translation/cache/stats` — Verifies cache tracking (hits, misses, items in memory).
6. `POST /api/smart-tools/execute` (`action=grammar`) — Checks error correction and rule explanation.
7. `POST /api/smart-tools/execute` (`action=tone`) — Validates tone transformation (formal/casual).
8. `POST /api/smart-tools/execute` (`action=pronounce`) — Checks phonetic transcription and speech guidance.
9. `POST /api/conversations` — Validates zero-DB in-memory conversation creation.
10. `POST /api/chat/message` — Verifies message persistence and multi-turn context linking.
11. `GET /api/conversations/:id` — Confirms chat history retrieval with saved messages.
12. `GET /api/admin/system-health` — Verifies system diagnostics, memory usage, and cache metrics.

**Expected Output**:
```
====================================================
 LinguaMate AI - Comprehensive Upgrade Verification
====================================================

• Testing: GET /api/health responds with active Gemini model... ✓ PASSED
• Testing: GET /api/speech/capabilities returns all 16 supported languages... ✓ PASSED
• Testing: POST /api/translation/translate with mode=academic... ✓ PASSED
• Testing: POST /api/translation/translate cache hit on repeated query... ✓ PASSED
• Testing: GET /api/translation/cache/stats returns live hit rate and memory count... ✓ PASSED
• Testing: POST /api/smart-tools/execute (grammar)... ✓ PASSED
• Testing: POST /api/smart-tools/execute (tone)... ✓ PASSED
• Testing: POST /api/smart-tools/execute (pronounce)... ✓ PASSED
• Testing: POST /api/conversations creates in-memory conversation... ✓ PASSED
• Testing: POST /api/chat/message processes and saves in-memory message... ✓ PASSED
• Testing: GET /api/conversations/:id retrieves conversation with saved messages... ✓ PASSED
• Testing: GET /api/admin/system-health returns platform diagnostics & cache metrics... ✓ PASSED

====================================================
 Test Summary: 12 Passed, 0 Failed
====================================================
```

---

### 1.2 Core Integration Test Suite (8 Tests)
Validates authentication, idiom explanation, clarification triggers, and pronoun resolution.

```bash
cd backend
npm test
# or: node test/api.test.js
```

**Expected Output**:
```
====================================================
 LinguaMate AI - Automated Integration Verification
 Target URL: http://localhost:5000/api
====================================================

• Testing: GET /api/health responds with status and integration health... ✓ PASSED
• Testing: GET /api/speech/capabilities returns provider configuration... ✓ PASSED
• Testing: POST /api/auth/register creates user and returns JWT... ✓ PASSED
• Testing: GET /api/auth/me returns authenticated user details... ✓ PASSED
• Testing: POST /api/translation/translate translates and explains cultural idiom... ✓ PASSED
• Testing: POST /api/chat/message identifies ambiguity and triggers clarification... ✓ PASSED
• Testing: POST /api/chat/message processes mixed-language inquiry... ✓ PASSED
• Testing: POST /api/chat/message resolves pronoun reference in follow-up... ✓ PASSED

====================================================
 Test Summary: 8 Passed, 0 Failed
====================================================
```

---

## 2. Frontend Production Build Verification

Verify that all 1,659 Vite modules, Tailwind CSS rules, and React components compile cleanly without syntax errors or missing dependencies:

```bash
cd frontend
npm run build
```

**Expected Output**:
```
✓ 1659 modules transformed.
dist/index.html                   0.82 kB │ gzip:  0.42 kB
dist/assets/index-....css        34.12 kB │ gzip:  6.45 kB
dist/assets/index-....js        498.23 kB │ gzip: 142.10 kB
✓ built in ~19s
```

---

## 3. Manual Live Verification Workflows

Open the web application in Chrome, Edge, or Firefox at `http://localhost:5173`.

### 3.1 Translation & Smart AI Tools (`/translate`)
1. **10 Translation Modes**:
   - Select Source: `English`, Target: `Spanish`.
   - Enter text: `"We need to finish this report by tomorrow morning."`
   - Test mode: `Academic` vs `Casual` vs `Business`.
   - Verify that tone and vocabulary dynamically adapt.
2. **Instant Performance Cache**:
   - Click "Translate & Explain" again with the same input.
   - Look for the badge: `⚡ Instant Cache (0ms)` indicating an instant in-memory cache hit.
3. **Smart AI Tools Tabs**:
   - Click **Grammar**: Verify error highlight and explanation.
   - Click **Tone**: Switch to `Formal` or `Friendly`.
   - Click **Pronunciation**: Verify phonetic breakdown and articulation guidance.
   - Click **Compare**: View 3 alternative natural expressions.
4. **Voice Dictation & Text-to-Speech**:
   - Click the microphone icon in the source box: Speak into your mic; verify text auto-populates.
   - Click the speaker icon on the translated output: Verify clear vocal synthesis in the target language.

### 3.2 Two-Person Translation Split Screen (`/two-person`)
1. Set Person A to `English` and Person B to `Hindi` (or `Tamil`, `French`, `Spanish`).
2. Person A clicks their microphone button and speaks in English.
3. Verify Person B's screen automatically displays the translated text and plays speech audio.
4. Person B clicks their microphone and replies. Verify Person A receives real-time translated audio.

### 3.3 Live Conversational Voice Room (`/live-voice`)
1. Select target language and conversation mode (`Bilingual Voice Conversation`).
2. Click **Start Listening** to activate continuous speech capture.
3. Speak a sentence; verify transcript appears in real-time, Gemini replies intelligently, and voice synthesis reads out the response.

### 3.4 Full Document Translation (`/knowledge`)
1. Scroll down to the **Full Document Translation** section.
2. Choose a `.txt` or `.pdf` file from your computer.
3. Select the target language (e.g. `French` or `Hindi`).
4. Click **Translate Document**.
5. Verify the translated preview appears in the document viewer.
6. Click **Download Translated (.txt)** to verify the downloaded file contains the complete translated document.

### 3.5 Admin Health & Cache Diagnostics (`/admin`)
1. Navigate to the Admin Dashboard.
2. Check the **Translation Cache Performance** card:
   - Verify Cache Hit Rate percentage.
   - Verify Cached Items count.
   - Verify Estimated Latency Saved metric.
3. Check the System Health section:
   - Verify active AI model is displayed (`gemini-3.5-flash-lite`).
   - Verify database status indicates `In-Memory Fallback` or `Connected`.
