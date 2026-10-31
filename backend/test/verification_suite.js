import http from 'http';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const start = Date.now();
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          const latency = Date.now() - start;
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode, data: parsed, latency });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: rawData, latency });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function run12Tests() {
  console.log('====================================================');
  console.log(' LinguaMate AI - 12 Specific Verification Tests');
  console.log(' Target URL: http://localhost:5000/api');
  console.log('====================================================\n');

  const results = [];

  // 1. English to Hindi
  console.log('--- Test 1: Translate English to Hindi ---');
  const t1 = await makeRequest('POST', '/translation/translate', {
    text: 'Good morning, how can I assist you with your project today?',
    targetLanguage: 'hi',
    sourceLanguage: 'en',
    mode: 'natural',
  });
  console.log(`Input: "Good morning, how can I assist you with your project today?"`);
  console.log(`Output: "${t1.data?.data?.translatedText}"`);
  console.log(`Latency: ${t1.latency}ms | Status: ${t1.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '1. English to Hindi', pass: t1.statusCode === 200 && !!t1.data?.data?.translatedText, latency: t1.latency });

  // 2. Hindi to English
  console.log('--- Test 2: Translate Hindi to English ---');
  const t2 = await makeRequest('POST', '/translation/translate', {
    text: 'मुझे इस विषय के बारे में और अधिक जानकारी चाहिए।',
    targetLanguage: 'en',
    sourceLanguage: 'hi',
    mode: 'standard',
  });
  console.log(`Input: "मुझे इस विषय के बारे में और अधिक जानकारी चाहिए।"`);
  console.log(`Output: "${t2.data?.data?.translatedText}"`);
  console.log(`Latency: ${t2.latency}ms | Status: ${t2.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '2. Hindi to English', pass: t2.statusCode === 200 && !!t2.data?.data?.translatedText, latency: t2.latency });

  // 3. English to Tamil
  console.log('--- Test 3: Translate English to Tamil ---');
  const t3 = await makeRequest('POST', '/translation/translate', {
    text: 'Welcome to our platform. Please select your desired option.',
    targetLanguage: 'ta',
    sourceLanguage: 'en',
    formality: 'polite',
    mode: 'natural',
  });
  console.log(`Input: "Welcome to our platform. Please select your desired option."`);
  console.log(`Output: "${t3.data?.data?.translatedText}"`);
  console.log(`Latency: ${t3.latency}ms | Status: ${t3.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '3. English to Tamil', pass: t3.statusCode === 200 && !!t3.data?.data?.translatedText, latency: t3.latency });

  // 4. Tamil to English
  console.log('--- Test 4: Translate Tamil to English ---');
  const t4 = await makeRequest('POST', '/translation/translate', {
    text: 'நாளை காலை பத்து மணிக்கு நாம் சந்திக்கலாம்.',
    targetLanguage: 'en',
    sourceLanguage: 'ta',
    mode: 'natural',
  });
  console.log(`Input: "நாளை காலை பத்து மணிக்கு நாம் சந்திக்கலாம்."`);
  console.log(`Output: "${t4.data?.data?.translatedText}"`);
  console.log(`Latency: ${t4.latency}ms | Status: ${t4.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '4. Tamil to English', pass: t4.statusCode === 200 && !!t4.data?.data?.translatedText, latency: t4.latency });

  // 5. Test long sentences
  console.log('--- Test 5: Translate Long Sentence ---');
  const longSentence = 'Artificial intelligence systems designed for real-time multilingual communication must carefully preserve idiomatic nuances, conversational tone, and exact numerical figures while simultaneously minimizing latency for end-users across diverse geographic locations.';
  const t5 = await makeRequest('POST', '/translation/translate', {
    text: longSentence,
    targetLanguage: 'es',
    sourceLanguage: 'en',
    mode: 'academic',
  });
  console.log(`Input: "${longSentence.substring(0, 60)}..."`);
  console.log(`Output: "${t5.data?.data?.translatedText?.substring(0, 70)}..."`);
  console.log(`Latency: ${t5.latency}ms | Status: ${t5.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '5. Long Sentence', pass: t5.statusCode === 200 && !!t5.data?.data?.translatedText, latency: t5.latency });

  // 6. Test mixed-language input (Code-mixing: Tanglish / Hinglish)
  console.log('--- Test 6: Mixed-Language Input (Tanglish) ---');
  const t6 = await makeRequest('POST', '/translation/translate', {
    text: 'Sir, admission fees evlo and last date eppo?',
    targetLanguage: 'en',
    sourceLanguage: 'auto',
    mode: 'natural',
  });
  console.log(`Input: "Sir, admission fees evlo and last date eppo?"`);
  console.log(`Output: "${t6.data?.data?.translatedText}"`);
  console.log(`Detected: "${t6.data?.data?.detectedSourceLanguage}"`);
  console.log(`Latency: ${t6.latency}ms | Status: ${t6.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '6. Mixed-Language Input', pass: t6.statusCode === 200 && !!t6.data?.data?.translatedText, latency: t6.latency });

  // 7. Test grammar and idioms
  console.log('--- Test 7: Grammar and Idiom Explanation ---');
  const t7 = await makeRequest('POST', '/translation/translate', {
    text: 'Break a leg on your presentation tomorrow!',
    targetLanguage: 'hi',
    sourceLanguage: 'en',
    mode: 'cultural',
  });
  console.log(`Input: "Break a leg on your presentation tomorrow!"`);
  console.log(`Translated: "${t7.data?.data?.translatedText}"`);
  console.log(`Cultural Meaning: "${t7.data?.data?.intendedMeaning}"`);
  console.log(`Latency: ${t7.latency}ms | Status: ${t7.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '7. Grammar & Idioms', pass: t7.statusCode === 200 && !t7.data?.data?.translatedText?.includes('टांग तोड़'), latency: t7.latency });

  // 8. Test follow-up questions
  console.log('--- Test 8: Follow-up Questions in Chat ---');
  const t8 = await makeRequest('POST', '/chat/message', {
    text: 'What is the schedule for tomorrow?',
    language: 'en',
  });
  console.log(`Input: "What is the schedule for tomorrow?"`);
  console.log(`Response: "${t8.data?.response?.text?.substring(0, 60)}..."`);
  console.log(`Follow-up Suggestions: ${JSON.stringify(t8.data?.response?.followUpSuggestions)}`);
  console.log(`Latency: ${t8.latency}ms | Status: ${t8.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '8. Follow-up Questions', pass: t8.statusCode === 200 && Array.isArray(t8.data?.response?.followUpSuggestions), latency: t8.latency });

  // 9. Test voice input (Speech capabilities endpoint)
  console.log('--- Test 9: Voice Capabilities & STT/TTS Mapping ---');
  const t9 = await makeRequest('GET', '/speech/capabilities');
  console.log(`Supported Languages: ${t9.data?.capabilities?.supportedLanguages?.length} languages`);
  console.log(`STT Provider: ${t9.data?.capabilities?.providers?.stt?.provider} | TTS Provider: ${t9.data?.capabilities?.providers?.tts?.provider}`);
  console.log(`Latency: ${t9.latency}ms | Status: ${t9.data?.capabilities?.supportedLanguages?.length >= 16 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '9. Voice Input Capabilities', pass: t9.statusCode === 200 && t9.data?.capabilities?.supportedLanguages?.length >= 16, latency: t9.latency });

  // 10. Test text-to-speech pronunciation guide
  console.log('--- Test 10: TTS & Pronunciation Guide Tool ---');
  const t10 = await makeRequest('POST', '/smart-tools/execute', {
    action: 'pronounce',
    text: 'Bonjour',
    language: 'fr',
  });
  console.log(`Input: "Bonjour" (fr)`);
  console.log(`Phonetic: "${t10.data?.data?.phoneticSpelling}"`);
  console.log(`Mouth/Tongue Tips: "${t10.data?.data?.audioTips}"`);
  console.log(`Latency: ${t10.latency}ms | Status: ${t10.statusCode === 200 && !!t10.data?.data?.phoneticSpelling ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '10. Text-to-Speech & Pronounce', pass: t10.statusCode === 200 && !!t10.data?.data?.phoneticSpelling, latency: t10.latency });

  // 11. Test conversation history
  console.log('--- Test 11: Multi-Turn Conversation History Persistence ---');
  const conv = await makeRequest('POST', '/conversations', { title: 'Test Session', language: 'en' });
  const convId = conv.data?.conversation?.id;
  const msg1 = await makeRequest('POST', '/chat/message', {
    conversationId: convId,
    text: 'My name is Alex and I need translation help.',
    language: 'en',
  });
  const msg2 = await makeRequest('POST', '/chat/message', {
    conversationId: convId,
    text: 'What did I say my name was?',
    language: 'en',
  });
  console.log(`Conv ID: ${convId}`);
  console.log(`Turn 1: "My name is Alex and I need translation help."`);
  console.log(`Turn 2: "What did I say my name was?"`);
  console.log(`Assistant Reply: "${msg2.data?.response?.text}"`);
  const historyCheck = await makeRequest('GET', `/conversations/${convId}`);
  console.log(`Saved Messages in History: ${historyCheck.data?.messages?.length}`);
  console.log(`Latency: ${msg2.latency}ms | Status: ${historyCheck.data?.messages?.length >= 2 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '11. Conversation History', pass: historyCheck.data?.messages?.length >= 2, latency: msg2.latency });

  // 12. Test API failure handling (Invalid request / fallback handling)
  console.log('--- Test 12: API Validation & Error Handling ---');
  const t12 = await makeRequest('POST', '/translation/translate', {
    text: '', // Empty text should trigger Zod 400 validation error cleanly
    targetLanguage: 'es',
  });
  console.log(`Empty input validation HTTP status: ${t12.statusCode}`);
  console.log(`Error Response: ${JSON.stringify(t12.data?.error || t12.data)}`);
  console.log(`Latency: ${t12.latency}ms | Status: ${t12.statusCode === 400 ? 'PASS' : 'FAIL'}\n`);
  results.push({ name: '12. API Error Handling', pass: t12.statusCode === 400, latency: t12.latency });

  console.log('====================================================');
  console.log(` Test Summary: ${results.filter(r => r.pass).length}/12 PASSED`);
  console.log('====================================================');
  results.forEach(r => console.log(`• ${r.name}: ${r.pass ? '✓ PASS' : '✗ FAIL'} (${r.latency}ms)`));
}

run12Tests().catch(console.error);
