import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, checkConfigStatus } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

// Import Routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import speechRoutes from './routes/speechRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import smartToolsRoutes from './routes/smartToolsRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed) || allowed === '*')) {
        return callback(null, true);
      }
      // If deployed on Vercel or Netlify preview / custom domain, allow in production
      if (process.env.NODE_ENV === 'production' &&
         (origin.includes('vercel.app') || origin.includes('netlify.app'))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/hackathon to prevent CORS hurdles
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smart-tools', smartToolsRoutes);

// Serve static frontend files if built
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root fallback route when frontend is not built
  app.get('/', (req, res) => {
    res.json({
      message: 'LinguaMate AI Backend API is running.',
      docs: '/api/health',
      version: '1.0.0',
    });
  });
}

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` LinguaMate AI Backend Server`);
  console.log(` Running on port: ${config.port}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Health check: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);

  const status = checkConfigStatus();
  if (!status.isConfigured) {
    console.warn(`[Config Notice] Missing external keys: ${status.missing.join(', ')}`);
    console.warn(`Set these in backend/.env to enable live Supabase & Gemini integrations.`);
  } else {
    console.log(`[Config Success] Supabase and Gemini configurations detected.`);
  }
});

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully...');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
