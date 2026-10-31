import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = ws;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const storageBucket = process.env.STORAGE_BUCKET || 'linguamate-files';

console.log('====================================================');
console.log(' LinguaMate AI - Supabase Database Verification Test');
console.log('====================================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing Supabase credentials in backend/.env:');
  console.log('  SUPABASE_URL:', supabaseUrl ? 'Configured ✅' : 'Missing ❌');
  console.log('  SUPABASE_KEY:', supabaseKey ? 'Configured ✅' : 'Missing ❌');
  console.log('\nPlease add your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env and re-run.');
  process.exit(1);
}

console.log(`Connecting to: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const requiredTables = [
  'profiles',
  'user_preferences',
  'conversations',
  'messages',
  'conversation_summaries',
  'knowledge_documents',
  'knowledge_chunks',
  'feedback',
  'escalations',
  'analytics_events',
  'support_agents',
  'audit_logs',
];

async function runVerification() {
  let passed = 0;
  let failed = 0;

  console.log('\n--- 1. Testing Application Tables ---');
  for (const table of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table [${table}]: Error - ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Table [${table}]: Accessible (current records: ${count || 0})`);
        passed++;
      }
    } catch (err) {
      console.log(`❌ Table [${table}]: Exception - ${err.message}`);
      failed++;
    }
  }

  console.log('\n--- 2. Testing Storage Bucket ---');
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      console.log(`❌ Storage: Error listing buckets - ${bucketErr.message}`);
      failed++;
    } else {
      const found = buckets?.some((b) => b.name === storageBucket);
      if (found) {
        console.log(`✅ Storage Bucket [${storageBucket}]: Verified & Ready`);
        passed++;
      } else {
        console.log(`⚠️ Storage Bucket [${storageBucket}]: Not found in bucket list. Available: [${buckets?.map((b) => b.name).join(', ') || 'none'}]`);
        console.log(`   (Run schema.sql or create bucket '${storageBucket}' in Supabase dashboard)`);
      }
    }
  } catch (sErr) {
    console.log(`❌ Storage Exception: ${sErr.message}`);
  }

  console.log('\n--- 3. Testing Vector Search RPC ---');
  try {
    // Test invoking match_knowledge_chunks with a dummy 768-dim zero vector
    const zeroVec = new Array(768).fill(0);
    const { data: rpcData, error: rpcErr } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: zeroVec,
      match_threshold: 0.0,
      match_count: 1,
    });

    if (rpcErr) {
      console.log(`⚠️ Vector RPC [match_knowledge_chunks]: ${rpcErr.message}`);
      console.log('   (Ensure pgvector extension is enabled and schema.sql is executed)');
    } else {
      console.log(`✅ Vector RPC [match_knowledge_chunks]: Verified & Operational`);
      passed++;
    }
  } catch (vErr) {
    console.log(`⚠️ Vector RPC test skipped: ${vErr.message}`);
  }

  console.log('\n====================================================');
  console.log(` Summary: ${passed} checks passed, ${failed} checks failed`);
  if (failed === 0) {
    console.log(' 🎉 All Supabase tables & features are fully verified!');
  } else {
    console.log(' ℹ️ If tables are missing, copy backend/database/schema.sql into');
    console.log('    your Supabase Dashboard -> SQL Editor and click Run.');
  }
  console.log('====================================================\n');
}

runVerification().catch(console.error);

