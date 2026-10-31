import assert from 'assert';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function testSuperFastMode() {
  console.log('====================================================');
  console.log(' LinguaMate AI - Super Fast Mode Automated Test');
  console.log(' Target URL:', BASE_URL);
  console.log('====================================================\n');

  // Test 1: Super Fast Mode Request
  console.log('--- Test 1: Super Fast Mode Translation (speedMode: "fast") ---');
  const t0 = Date.now();
  const fastRes = await fetch(`${BASE_URL}/translation/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Good morning, please direct me to the nearest train station.',
      targetLanguage: 'es',
      speedMode: 'fast',
    }),
  });
  const fastData = await fastRes.json();
  const fastLatency = Date.now() - t0;
  console.log('Fast Mode Status:', fastRes.status);
  console.log('Fast Mode Response:', fastData.data?.translatedText);
  console.log('Reported Latency:', fastData.latencyMs, 'ms | Total Roundtrip:', fastLatency, 'ms');
  console.log('Returned speedMode:', fastData.speedMode);
  assert.strictEqual(fastRes.status, 200);
  assert.strictEqual(fastData.speedMode, 'fast');
  assert(fastData.data?.translatedText?.length > 0, 'Must have translated text');

  // Test 2: Instant Cache on Repeat Super Fast Mode
  console.log('\n--- Test 2: Instant Cache on Repeat Super Fast Mode ---');
  const t1 = Date.now();
  const cacheRes = await fetch(`${BASE_URL}/translation/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Good morning, please direct me to the nearest train station.',
      targetLanguage: 'es',
      speedMode: 'fast',
    }),
  });
  const cacheData = await cacheRes.json();
  const cacheLatency = Date.now() - t1;
  console.log('Cached Result:', cacheData.data?.translatedText);
  console.log('Cached Flag:', cacheData.cached);
  console.log('Reported Latency:', cacheData.latencyMs, 'ms | Total Roundtrip:', cacheLatency, 'ms');
  assert.strictEqual(cacheData.cached, true);
  assert(cacheData.latencyMs < 50, 'Cache hit must be ultra-low latency (<50ms)');

  // Test 3: Balanced Mode Request with Cultural Context
  console.log('\n--- Test 3: Balanced Mode Translation (speedMode: "balanced") ---');
  const t2 = Date.now();
  const balancedRes = await fetch(`${BASE_URL}/translation/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Break a leg on your presentation tomorrow!',
      targetLanguage: 'hi',
      speedMode: 'balanced',
      mode: 'cultural',
    }),
  });
  const balancedData = await balancedRes.json();
  const balancedLatency = Date.now() - t2;
  console.log('Balanced Mode Status:', balancedRes.status);
  console.log('Balanced Mode Translation:', balancedData.data?.translatedText);
  console.log('Balanced Mode Cultural Context:', balancedData.data?.culturalContext);
  console.log('Reported Latency:', balancedData.latencyMs, 'ms | Total Roundtrip:', balancedLatency, 'ms');
  assert.strictEqual(balancedRes.status, 200);
  assert.strictEqual(balancedData.speedMode, 'balanced');
  assert(balancedData.data?.culturalContext?.length > 0, 'Balanced mode should include rich cultural context');

  // Test 4: Chat Message with Super Fast Mode
  console.log('\n--- Test 4: Chat Message (speedMode: "fast") ---');
  const chatRes = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello, what languages do you support?',
      language: 'en',
      speedMode: 'fast',
    }),
  });
  const chatData = await chatRes.json();
  console.log('Chat Status:', chatRes.status);
  console.log('Chat Response:', chatData.response?.text?.substring(0, 100) + '...');
  console.log('Chat speedMode:', chatData.speedMode);
  assert.strictEqual(chatRes.status, 200);
  assert.strictEqual(chatData.speedMode, 'fast');

  console.log('\n====================================================');
  console.log(' 🎉 All Super Fast Mode Tests PASSED Successfully!');
  console.log('====================================================');
}

testSuperFastMode().catch((err) => {
  console.error('❌ Super Fast Mode Test Failed:', err);
  process.exit(1);
});

