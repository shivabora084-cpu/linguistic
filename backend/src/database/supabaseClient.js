import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { config } from '../config/index.js';

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = ws;
}

let supabaseInstance = null;

if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
  supabaseInstance = createClient(config.supabase.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = supabaseInstance;

/**
 * Comprehensive health check for Supabase database & storage connection
 */
export const testDatabaseConnection = async () => {
  if (!supabaseInstance) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in backend environment variables.',
      tables: {},
      storage: { ready: false, message: 'Supabase client not initialized' },
    };
  }

  const tablesToCheck = [
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

  const tableResults = {};
  let overallSuccess = true;

  try {
    // Quick test on primary table: profiles
    const { data, error } = await supabaseInstance
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        message: `Supabase query error on profiles table: ${error.message}`,
        details: error,
      };
    }

    // Check all application tables
    await Promise.all(
      tablesToCheck.map(async (table) => {
        try {
          const { error: tblErr } = await supabaseInstance
            .from(table)
            .select('count', { count: 'exact', head: true });
          tableResults[table] = tblErr ? `Error: ${tblErr.message}` : 'OK';
          if (tblErr) overallSuccess = false;
        } catch (e) {
          tableResults[table] = `Failed: ${e.message}`;
          overallSuccess = false;
        }
      })
    );

    // Test storage bucket accessibility
    let storageStatus = { ready: false };
    try {
      const { data: buckets, error: bError } = await supabaseInstance.storage.listBuckets();
      if (!bError && buckets) {
        const found = buckets.some((b) => b.name === config.supabase.storageBucket);
        storageStatus = {
          ready: found,
          bucket: config.supabase.storageBucket,
          availableBuckets: buckets.map((b) => b.name),
        };
      } else {
        storageStatus = { ready: false, error: bError?.message };
      }
    } catch (sErr) {
      storageStatus = { ready: false, error: sErr.message };
    }

    return {
      connected: true,
      message: overallSuccess
        ? 'Successfully connected to Supabase PostgreSQL database. All tables verified.'
        : 'Connected to Supabase, but some tables require schema migration.',
      tables: tableResults,
      storage: storageStatus,
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
};
