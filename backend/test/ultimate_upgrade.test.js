import assert from 'node:assert';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' LinguaMate AI - Comprehensive Upgrade Verification');
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
  await test('GET /api/health responds with active Gemini model', async () => {
    const res = await fetch(`${API_BASE}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.status === 'healthy' || data.status === 'partially_configured');
    assert.ok(data.integrations.gemini.connected);
  });

  // 2. 16 Supported Languages in Speech Capabilities
  await test('GET /api/speech/capabilities returns all 16 supported languages', async () => {
    const res = await fetch(`${API_BASE}/speech/capabilities`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.capabilities.totalLanguages, 16);
    assert.strictEqual(data.capabilities.supportedLanguages.length, 16);
  });

  // 3. Translation Mode: Academic
  await test('POST /api/translation/translate with mode=academic', async () => {
    const res = await fetch(`${API_BASE}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'The quantum algorithm exhibits polynomial speedup in search queries.',
        targetLanguage: 'ta',
        mode: 'academic',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.translatedText);
  });

  // 4. In-Memory Cache Verification (Zero Latency Hit)
  await test('POST /api/translation/translate cache hit on repeated query', async () => {
    const start = Date.now();
    const res = await fetch(`${API_BASE}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'The quantum algorithm exhibits polynomial speedup in search queries.',
        targetLanguage: 'ta',
        mode: 'academic',
      }),
    });
    const elapsed = Date.now() - start;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.cached, true, 'Subsequent request must be served from cache');
    assert.ok(elapsed < 200, `Cache hit must be ultra-fast (took ${elapsed}ms)`);
  });

  // 5. Cache Stats Endpoint
  await test('GET /api/translation/cache/stats returns live hit rate and memory count', async () => {
    const res = await fetch(`${API_BASE}/translation/cache/stats`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.stats.hits >= 1);
  });

  // 6. Smart Tool: Grammar Correction
  await test('POST /api/smart-tools/execute (grammar)', async () => {
    const res = await fetch(`${API_BASE}/smart-tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'grammar',
        text: 'She do not goes to college yesterday.',
        language: 'en',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.correctedText);
  });

  // 7. Smart Tool: Tone Detector
  await test('POST /api/smart-tools/execute (tone)', async () => {
    const res = await fetch(`${API_BASE}/smart-tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'tone',
        text: 'Please submit the report immediately by 5 PM.',
        language: 'en',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.primaryTone);
  });

  // 8. Smart Tool: Pronunciation Guide
  await test('POST /api/smart-tools/execute (pronounce)', async () => {
    const res = await fetch(`${API_BASE}/smart-tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pronounce',
        text: 'வணக்கம்',
        language: 'ta',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.phoneticSpelling);
  });

  // 9. In-Memory Conversation Persistence (Zero-DB Mode)
  let convId = '';
  await test('POST /api/conversations creates in-memory conversation', async () => {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Admissions Inquiry', language: 'ta' }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.conversation.id);
    convId = data.conversation.id;
  });

  // 10. Chat Message in In-Memory Conversation
  await test('POST /api/chat/message processes and saves in-memory message', async () => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: convId,
        text: 'Admission fees evlo sir? Installments irukka?',
        language: 'ta',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.response.text);
    assert.strictEqual(data.conversationId, convId);
  });

  // 11. Retrieve Conversation History
  await test('GET /api/conversations/:id retrieves conversation with saved messages', async () => {
    const res = await fetch(`${API_BASE}/conversations/${convId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.messages.length >= 2, 'Must contain user and assistant messages');
  });

  // 12. Admin System Health with Cache Metrics
  await test('GET /api/admin/system-health returns platform diagnostics & cache metrics', async () => {
    const res = await fetch(`${API_BASE}/admin/system-health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.cachePerformance);
    assert.ok(data.cachePerformance.hits >= 1);
  });

  console.log('\n====================================================');
  console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
