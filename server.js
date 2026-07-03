import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { AGRI_EXPERT_V1 } from './apps/web/utils/prompts.js';
import { retrieveContext } from './apps/web/services/ragService.js';

// Modular Backend Components
import logger from './src/utils/logger.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { initApiRoutes, getSeason, filterOutput } from './src/routes/api.js';
import { initVoiceWebSocket } from './src/websocket/voice.handler.js';
import { loadConfig } from './src/utils/configManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// API KEY SETUP (Backend Only)
// =============================================================================
const cleanKey = (key) => key ? key.trim().replace(/^["']|["']$/g, '') : '';
const RAW_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
const API_KEY = cleanKey(RAW_API_KEY);

// =============================================================================
// PERSISTENCE SETUP
// =============================================================================
const DATA_DIR = path.join(__dirname, 'data_store');
const LOG_FILE = path.join(DATA_DIR, 'activity_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    logger.info(`📁 Created data directory: ${DATA_DIR}`);
  } catch (e) {
    logger.error('❌ Failed to create data dir:', { error: e.message });
  }
}

// In-memory store for activity logs
let GLOBAL_ACTIVITY_LOGS = [];

if (fs.existsSync(LOG_FILE)) {
  try {
    const fileData = fs.readFileSync(LOG_FILE, 'utf8');
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed)) {
      GLOBAL_ACTIVITY_LOGS = parsed;
      logger.info(`📂 Loaded ${GLOBAL_ACTIVITY_LOGS.length} activity logs from disk.`);
    }
  } catch (e) {
    logger.error('❌ Failed to load logs from disk:', { error: e.message });
  }
}

// Debounced save
let saveTimeout = null;
const saveLogsToDisk = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFile(
        LOG_FILE,
        JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2),
        'utf8',
        (err) => {
          if (err) logger.error('❌ Error writing logs to disk:', { error: err.message });
        }
      );
    } catch (e) {
      logger.error('❌ Sync write error:', { error: e.message });
    }
  }, 500);
};

// =============================================================================
// STARTUP LOGGING
// =============================================================================
logger.info('🚀 Starting modular Express proxy server...');
logger.info(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
logger.info(`🔑 API Key configured: ${API_KEY ? '✅ YES' : '❌ NO'}`);
if (!API_KEY) {
  logger.error('❌ CRITICAL: No API key found! Check API_KEY / GOOGLE_API_KEY / GEMINI_API_KEY env vars.');
}

// =============================================================================
// MIDDLEWARES
// =============================================================================

// HTTPS Redirect (Production only)
app.use((req, res, next) => {
  if (isProduction && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// CORS & Cache Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.removeHeader('X-Powered-By');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body Parser
app.use(express.json({ limit: '10mb' }));

// Response Latency Header injection
app.use('/api', (req, res, next) => {
  req._apiStartTime = Date.now();
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const latencyMs = Date.now() - req._apiStartTime;
    res.set('X-Response-Time', `${latencyMs}ms`);
    return originalJson(body);
  };
  next();
});

// AI CLIENT FACTORY
const getAIClient = () => {
  const config = loadConfig();
  const providerKey = config.ai?.providers?.gemini?.apiKey || API_KEY;
  if (!providerKey) {
    throw new Error('Gemini API key is not configured. Please configure it in the Admin Settings panel.');
  }
  return new GoogleGenAI({ 
    apiKey: providerKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// =============================================================================
// INITIALIZE MODULAR ROUTES
// =============================================================================
initApiRoutes(app, getAIClient, API_KEY, GLOBAL_ACTIVITY_LOGS, saveLogsToDisk);

// =============================================================================
// FRONTEND SERVING (Vulnerability Exclude: Injecting API_KEY: null for security)
// =============================================================================
const outPath = path.resolve(__dirname, 'apps/web/out');

const serveIndexWithInjection = (req, res) => {
  const isAppRoute = req.path === '/app' || req.path.startsWith('/app/');
  const indexPath = isAppRoute
    ? path.resolve(outPath, 'app/index.html')
    : path.resolve(outPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Application build output not found. Please run npm run build.');
  }

  try {
    let html = fs.readFileSync(indexPath, 'utf-8');
    const envScript = `<script>
      window.ENV = {
        API_KEY: null
      };
    </script>`;
    html = html.replace('</head>', `${envScript}</head>`);
    return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    logger.error('❌ Error serving index.html:', { error: e.message });
    return res.status(500).send('Failed to load application.');
  }
};

app.use((req, res, next) => {
  if (req.path === '/sw.js') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.static(outPath, { index: false }));

app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (ext.length > 0 && ext !== '.html') {
    return res.status(404).end();
  }
  next();
});

app.get('/', serveIndexWithInjection);
app.get('/index.html', serveIndexWithInjection);
app.get('*', serveIndexWithInjection);

// Centralized error handler middleware
app.use(errorHandler);

// =============================================================================
// SERVER & WEBSOCKET BOOT
// =============================================================================
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ Server listening on port ${PORT}`);
  logger.info(`🌐 Local URL: http://localhost:${PORT}`);
});

const wss = initVoiceWebSocket(server, getAIClient, API_KEY, getSeason, retrieveContext, AGRI_EXPERT_V1);

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
const gracefulShutdown = (signal) => {
  logger.info(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2), 'utf8');
    logger.info('💾 Logs saved to disk.');
  } catch (e) {
    logger.error('❌ Failed to save logs on shutdown:', { error: e.message });
  }

  wss.clients.forEach(client => {
    try { client.close(1001, 'Server shutting down'); } catch (e) { /* ignore */ }
  });

  server.close(() => {
    logger.info('✅ HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('❌ Forced exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Promise Rejection:', { reason: String(reason) });
});