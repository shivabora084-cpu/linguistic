import { testGeminiConnection, generateWithFallback } from '../src/services/geminiService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('====================================================');
console.log(' LinguaMate AI - Gemini AI Verification Test');
console.log('====================================================');

async function runTest() {
  console.log('\n--- 1. Testing Gemini Health Connection ---');
  const health = await testGeminiConnection();
  console.log('Gemini Status:', health.connected ? 'Connected ✅' : 'Failed ❌');
  console.log('Message:', health.message);
  if (health.sampleResponse) {
    console.log('Sample output:', health.sampleResponse);
  }

  if (health.connected) {
    console.log('\n--- 2. Testing Multilingual Reasoning ---');
    try {
      const res = await generateWithFallback(
        'User says in Tamil-English: "Sir, admission fees evlo? Can I pay in installments?" Answer in Tamil with English terms in brackets.',
        { maxTokens: 100 }
      );
      console.log('Model Used:', res.modelUsed);
      console.log('Response:\n', res.text);
      console.log('\n✅ Gemini AI is fully functional and ready!');
    } catch (e) {
      console.error('Generation test error:', e.message);
    }
  }
  console.log('====================================================\n');
}

runTest().catch(console.error);

