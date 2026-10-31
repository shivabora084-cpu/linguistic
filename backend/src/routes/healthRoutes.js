import { Router } from 'express';
import { testDatabaseConnection } from '../database/supabaseClient.js';
import { testGeminiConnection } from '../services/geminiService.js';
import { checkConfigStatus } from '../config/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const configStatus = checkConfigStatus();
  const dbHealth = await testDatabaseConnection();
  const aiHealth = await testGeminiConnection();

  const isHealthy = dbHealth.connected && aiHealth.connected;

  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'healthy' : 'partially_configured',
    service: 'LinguaMate AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    configuration: configStatus,
    integrations: {
      supabase: dbHealth,
      gemini: aiHealth,
    },
  });
});

export default router;
