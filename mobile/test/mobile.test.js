import assert from 'assert';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

console.log('====================================================');
console.log(' LinguaMate AI - Mobile Application Verification Suite');
console.log(' Target Backend URL:', BASE_URL);
console.log('====================================================\n');

let authToken = '';
let registeredEmail = `mobile_tester_${Date.now()}@linguamate.ai`;

async function runMobileTestSuite() {
  let passedCount = 0;
  let failedCount = 0;

  const test = async (name, fn) => {
    process.stdout.write(`• Testing: ${name}... `);
    try {
      await fn();
      console.log('✓ PASSED');
      passedCount++;
    } catch (err) {
      console.log(`❌ FAILED\n  Error: ${err.message}`);
      failedCount++;
    }
  };

  // --- SECTION 1: AUTHENTICATION TESTS ---
  console.log('--- 1. Authentication & Session Verification ---');

  await test('Mobile User Registration', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        password: 'Password123!',
        fullName: 'Mobile QA Engineer',
        preferredLanguage: 'ta',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Status ${res.status}`);
    assert(data.token, 'Token must be returned');
    assert.strictEqual(data.user.email, registeredEmail);
    authToken = data.token;
  });

  await test('Mobile User Login', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.token, 'JWT must be returned');
    assert.strictEqual(data.user.email, registeredEmail);
    authToken = data.token;
  });

  await test('Session Persistence via /auth/me Introspection', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.email, registeredEmail);
  });

  await test('Expired / Invalid Token Handling returns 401/403', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid_tampered_token_string' },
    });
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
  });

  // --- SECTION 2: MULTILINGUAL TRANSLATION SUITE ---
  console.log('\n--- 2. Core Translation Suite (English, Hindi, Tamil, Mixed) ---');

  await test('English to Hindi Translation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Where is the main library located?',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.length > 0);
  });

  await test('Hindi to English Translation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'मुझे इस परीक्षा के परिणाम की जानकारी चाहिए।',
        sourceLanguage: 'hi',
        targetLanguage: 'en',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.toLowerCase().includes('result') || data.data.translatedText.toLowerCase().includes('exam'));
  });

  await test('English to Tamil Translation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Welcome to our university campus.',
        sourceLanguage: 'en',
        targetLanguage: 'ta',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.length > 0);
  });

  await test('Tamil to English Translation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'நாளை காலை பத்து மணிக்கு நாம் சந்திக்கலாம்.',
        sourceLanguage: 'ta',
        targetLanguage: 'en',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.toLowerCase().includes('tomorrow') || data.data.translatedText.toLowerCase().includes('meet'));
  });

  await test('Long Sentence Translation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'International students who plan to enroll in academic degree programs must submit their verified certificates and transcripts before the deadline.',
        targetLanguage: 'es',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.length > 30);
  });

  await test('Mixed-Language Input (Tanglish / Hinglish)', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Sir, admission fees evlo and last date eppo?',
        targetLanguage: 'en',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.data.translatedText.toLowerCase().includes('fee') || data.data.translatedText.toLowerCase().includes('admission'));
  });

  await test('Names, Dates and Numbers Preservation', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Dr. Ramesh Sharma scheduled the meeting for October 31, 2026 with 45 attendees.',
        targetLanguage: 'es',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const out = data.data.translatedText;
    assert(out.includes('Ramesh') || out.includes('Sharma'), 'Must preserve names');
    assert(out.includes('45'), 'Must preserve numeric counts');
    assert(out.includes('2026'), 'Must preserve year dates');
  });

  await test('Empty Input Validation returns 400', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '',
        targetLanguage: 'es',
      }),
    });
    assert.strictEqual(res.status, 400, `Expected 400 validation error, got ${res.status}`);
  });

  // --- SECTION 3: SUPER FAST MODE SPECIFIC CHECKS ---
  console.log('\n--- 3. Super Fast Mode Verification ---');

  await test('Super Fast Mode returns speedMode: "fast"', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Please show me the bus schedule.',
        targetLanguage: 'fr',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.speedMode, 'fast');
    assert(typeof data.latencyMs === 'number');
  });

  await test('Instant Cache Hits on Repeat Super Fast Mode (<20ms)', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Please show me the bus schedule.',
        targetLanguage: 'fr',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.cached, true, 'Repeat translation must be cached');
    assert(data.latencyMs < 20, `Expected cache latency <20ms, got ${data.latencyMs}ms`);
  });

  await test('Balanced Mode returns Cultural Context', async () => {
    const res = await fetch(`${BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Break a leg on your presentation tomorrow!',
        targetLanguage: 'hi',
        speedMode: 'balanced',
        mode: 'cultural',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.speedMode, 'balanced');
    assert(data.data.culturalContext && data.data.culturalContext.length > 5);
  });

  // --- SECTION 4: CONVERSATION HISTORY & TWO-PERSON ---
  console.log('\n--- 4. Conversation History & Two-Person Dialogue ---');

  let convId = '';

  await test('Create Conversation in History', async () => {
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        text: 'My name is Alex and I need translation help.',
        language: 'en',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.conversationId, 'Conversation ID must be assigned');
    convId = data.conversationId;
  });

  await test('Context Memory Follow-up (Reference Resolution)', async () => {
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        conversationId: convId,
        text: 'What did I say my name was?',
        language: 'en',
        speedMode: 'fast',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.response.text.toLowerCase().includes('alex'), 'Must resolve Alex from conversation history');
  });

  await test('Retrieve Conversation List from Backend', async () => {
    const res = await fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(data.data));
  });

  await test('Delete Conversation from History', async () => {
    if (!convId) return;
    const res = await fetch(`${BASE_URL}/conversations/${convId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  console.log('\n====================================================');
  console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMobileTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
