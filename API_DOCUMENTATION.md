# LinguaMate AI - REST API Documentation

Base URL: `http://localhost:5000/api` (Local) / `https://your-backend.onrender.com/api` (Production)

---

## 1. Health & Diagnostics
### `GET /health`
Returns the status of the server, uptime, Supabase connection, and Gemini AI status.
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "LinguaMate AI Backend API",
  "version": "1.0.0",
  "uptimeSeconds": 120,
  "integrations": {
    "supabase": { "connected": true, "message": "Successfully connected to Supabase PostgreSQL database." },
    "gemini": { "connected": true, "message": "Successfully connected to Google Gemini API." }
  }
}
```

---

## 2. Authentication
### `POST /auth/register`
Creates a new user profile and returns a signed JWT.
- **Payload**:
```json
{
  "fullName": "Shiva Kumar",
  "email": "user@linguamate.ai",
  "password": "password123",
  "preferredLanguage": "ta",
  "role": "user"
}
```
- **Response**: `201 Created` with `{ token, user }`

### `POST /auth/login`
Authenticates user credentials and returns a signed JWT.
- **Payload**: `{ "email": "user@linguamate.ai", "password": "password123" }`

### `GET /auth/me`
Returns the currently authenticated profile and user preferences.
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Conversational AI & Chat
### `POST /chat/message`
Main conversational endpoint with intention analysis, mixed-language decoding, context resolution, and clarification.
- **Payload**:
```json
{
  "conversationId": "optional-uuid",
  "text": "Sir, admission fees evlo?",
  "language": "ta",
  "inputType": "text"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "conversationId": "uuid",
  "response": {
    "text": "The total admission fee is ₹25,000 according to college records.",
    "detectedLanguage": "ta",
    "mixedLanguages": ["ta", "en"],
    "intent": "fee_inquiry",
    "sentiment": "neutral",
    "urgency": "low",
    "isClarification": false,
    "clarificationOptions": [],
    "followUpSuggestions": ["Can I pay in installments?", "What is the last date to apply?"],
    "sourceDocuments": ["college_admission_guide.pdf"]
  }
}
```

---

## 4. Contextual Translation & Cultural Breakdown
### `POST /translation/translate`
Translates text taking into account idioms, cultural context, and formality.
- **Payload**:
```json
{
  "text": "Break a leg",
  "targetLanguage": "hi",
  "formality": "polite"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "translatedText": "शुभकामनाएं!",
    "literalTranslation": "अपनी टांग तोड़ लो",
    "intendedMeaning": "Wishing good luck",
    "culturalContext": "Western theatrical idiom wishing success.",
    "formalityLevel": "polite",
    "alternativePhrases": [{ "text": "All the best", "tone": "casual" }]
  }
}
```

---

## 5. Document Knowledge Base (RAG)
### `POST /knowledge/upload`
Uploads PDF or TXT to Supabase Storage, extracts text, chunks, embeds, and saves to `knowledge_chunks`.
- **Headers**: `multipart/form-data`, `Authorization: Bearer <token>`
- **Body**: `file`: [binary PDF]

### `POST /knowledge/query`
Directly queries the indexed documents using cosine similarity.
- **Payload**: `{ "query": "What are the required documents?", "language": "ta" }`

---

## 6. Support Escalations
### `POST /escalations`
Creates an escalation ticket for a human representative.
- **Payload**:
```json
{
  "conversationId": "uuid",
  "issueSummary": "Need fee concession approval",
  "escalationReason": "Requires administrative fee waiver approval",
  "urgency": "high",
  "preferredLanguage": "en"
}
```

---

## 7. Admin Analytics
### `GET /admin/analytics`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Response**: Live counts of users, conversations, messages, language distribution, and average ratings directly from PostgreSQL.
