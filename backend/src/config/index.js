import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.STORAGE_BUCKET || 'linguamate-files',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'linguamate_dev_jwt_secret_change_in_production_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  speech: {
    sttProvider: process.env.STT_PROVIDER || 'browser',
    ttsProvider: process.env.TTS_PROVIDER || 'browser',
  },
};

export const checkConfigStatus = () => {
  const missing = [];
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.anonKey && !config.supabase.serviceRoleKey) missing.push('SUPABASE_ANON_KEY / SERVICE_ROLE_KEY');
  if (!config.gemini.apiKey) missing.push('GEMINI_API_KEY');

  return {
    isConfigured: missing.length === 0,
    missing,
    supabaseConnected: Boolean(config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)),
    geminiConnected: Boolean(config.gemini.apiKey),
  };
};
