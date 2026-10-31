/**
 * Automated Verification & Integration Test Suite for LinguaMate AI
 */
import assert from 'node:assert';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' LinguaMate AI - Automated Integration Verification');
  console.log(` Target URL: ${API_BASE}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health responds with status and integration health', async () => {
    const res = await fetch(`${API_BASE}/health`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.service, 'Response must have service name');
    assert.ok(data.integrations, 'Response must describe integrations');
  });

  // 2. Speech capabilities
  await test('GET /api/speech/capabilities returns provider configuration', async () => {
    const res = await fetch(`${API_BASE}/speech/capabilities`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.capabilities.supportedLanguages.length >= 7);
  });

  // 3. User registration & JWT
  let testToken = '';
  const testEmail = `test_${Date.now()}@linguamate.ai`;
  await test('POST /api/auth/register creates user and returns JWT', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Hackathon Judge',
        email: testEmail,
        password: 'password123',
        preferredLanguage: 'ta',
        role: 'admin',
      }),
    });
    assert.strictEqual(res.status, 201, `Status ${res.status}`);
    const data = await res.json();
    assert.ok(data.token, 'Must return JWT token');
    assert.strictEqual(data.user.email, testEmail);
    testToken = data.token;
  });

  // 4. Authenticated profile
  await test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, testEmail);
  });

  // 5. Contextual translation & idioms
  await test('POST /api/translation/translate translates and explains cultural idiom', async () => {
    const res = await fetch(`${API_BASE}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Break a leg',
        targetLanguage: 'hi',
        formality: 'polite',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.translatedText);
  });

  // 6. Ambiguous clarification in chat
  await test('POST /api/chat/message identifies ambiguity and triggers clarification', async () => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        text: 'Cancel it',
        language: 'en',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.response.isClarification, 'Expected isClarification to be true for "Cancel it"');
  });

  // 7. Multi-turn conversation and context
  let convId = null;
  await test('POST /api/chat/message processes mixed-language inquiry', async () => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        text: 'Sir, admission fees evlo?',
        language: 'ta',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.conversationId);
    convId = data.conversationId;
  });

  // 8. Follow-up resolving pronoun "it"
  await test('POST /api/chat/message resolves pronoun reference in follow-up', async () => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({
        conversationId: convId,
        text: 'Can I pay it in installments?',
        language: 'en',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.response.text);
  });

  console.log('\n====================================================');
  console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
