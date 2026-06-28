import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer } from 'ws';
import { AGRI_EXPERT_V1, DISEASE_DIAGNOSIS_V1, WEATHER_ADVISORY_V1, SCHEME_MATCHER_V1, SOIL_INTERPRETER_V1 } from './apps/web/utils/prompts.js';
import { retrieveContext } from './apps/web/services/ragService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// API KEY SETUP
// =============================================================================
const cleanKey = (key) => key ? key.trim().replace(/^["']|["']$/g, '') : '';
const RAW_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
const API_KEY = cleanKey(RAW_API_KEY);

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';

// =============================================================================
// PERSISTENCE SETUP
// =============================================================================
const DATA_DIR = path.join(__dirname, 'data_store');
const LOG_FILE = path.join(DATA_DIR, 'activity_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${DATA_DIR}`);
  } catch (e) {
    console.error('❌ Failed to create data dir:', e);
  }
}

// In-memory store
let GLOBAL_ACTIVITY_LOGS = [];
const MAX_LOGS = 5000;

// Load logs on startup
if (fs.existsSync(LOG_FILE)) {
  try {
    const fileData = fs.readFileSync(LOG_FILE, 'utf8');
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed)) {
      GLOBAL_ACTIVITY_LOGS = parsed;
      console.log(`📂 Loaded ${GLOBAL_ACTIVITY_LOGS.length} activity logs from disk.`);
    }
  } catch (e) {
    console.error('❌ Failed to load logs from disk:', e.message);
    // Backup corrupted file and start fresh
    try {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.corrupt_${Date.now()}`);
      console.warn('⚠️ Corrupted log file backed up. Starting fresh.');
    } catch (backupErr) {
      console.error('❌ Could not backup corrupted log file:', backupErr.message);
    }
  }
}

// Debounced save - prevents hammering disk on rapid log writes
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
          if (err) console.error('❌ Error writing logs to disk:', err.message);
        }
      );
    } catch (e) {
      console.error('❌ Sync write error:', e.message);
    }
  }, 500); // Wait 500ms before writing to batch rapid requests
};

// =============================================================================
// STARTUP LOGS
// =============================================================================
console.log('🚀 Starting server...');
console.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`🔑 API Key configured: ${API_KEY ? '✅ YES' : '❌ NO'}`);
if (!API_KEY) {
  console.error('❌ CRITICAL: No API key found! Check API_KEY / GOOGLE_API_KEY / GEMINI_API_KEY env vars.');
}

// =============================================================================
// MIDDLEWARE
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

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body Parser
app.use(express.json({ limit: '10mb' }));

// Request Logger (Development only)
if (!isProduction) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`📥 ${req.method} ${req.path}`);
    }
    next();
  });
}

// =============================================================================
// AI CLIENT FACTORY
// =============================================================================
const getAIClient = () => {
  if (!API_KEY) {
    throw new Error('API_KEY not configured on server. Check environment variables.');
  }
  return new GoogleGenAI({ 
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// =============================================================================
// RATE LIMITER MIDDLEWARE (system-context.md §3.1-3.2)
// In-memory sliding window rate limiter — configurable per-route
// =============================================================================
const rateLimitStore = new Map(); // key: ip:route → { timestamps: number[] }

const rateLimiter = (maxRequests, windowMs) => (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { timestamps: [] });
  }
  
  const entry = rateLimitStore.get(key);
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
  
  if (entry.timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many requests',
      message: 'कृपया काही सेकंदांनी पुन्हा प्रयत्न करा',
      retryAfterSeconds: retryAfter
    });
  }
  
  entry.timestamps.push(now);
  next();
};

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 120000);
    if (entry.timestamps.length === 0) rateLimitStore.delete(key);
  }
}, 300000);

// =============================================================================
// REQUEST VALIDATION MIDDLEWARE (api-contracts.md)
// =============================================================================
const validateBody = (requiredFields) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }
  const missing = requiredFields.filter(f => !(f in req.body) || req.body[f] === undefined || req.body[f] === '');
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  next();
};

// =============================================================================
// API LATENCY LOGGING MIDDLEWARE (system-context.md §6)
// =============================================================================
app.use('/api', (req, res, next) => {
  req._apiStartTime = Date.now();
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const latencyMs = Date.now() - req._apiStartTime;
    if (!isProduction) {
      console.log(`⏱️ ${req.method} ${req.path} → ${res.statusCode} (${latencyMs}ms)`);
    }
    // Inject latency header for client-side performance monitoring
    res.set('X-Response-Time', `${latencyMs}ms`);
    return originalJson(body);
  };
  next();
});

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!API_KEY,
    environment: isProduction ? 'production' : 'development',
    logsCount: GLOBAL_ACTIVITY_LOGS.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// ACTIVITY / ANALYTICS ROUTES
// =============================================================================

const handleLogActivity = (req, res) => {
  try {
    const logData = req.body;

    // Validate minimum required fields
    if (!logData || typeof logData !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!logData.sessionId) {
      return res.status(400).json({ error: 'Missing required field: sessionId' });
    }

    if (!logData.userEmail) {
      return res.status(400).json({ error: 'Missing required field: userEmail' });
    }

    // FIX: Parse IP correctly for multi-proxy environments
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ip = rawIp.split(',')[0].trim();

    const enrichedLog = {
      ...logData,
      serverTimestamp: Date.now(),   // Authoritative server time
      ip,
      userAgent: logData.userAgent || req.headers['user-agent'] || 'unknown'
    };

    // Add to beginning of array (newest first), trim if over limit
    GLOBAL_ACTIVITY_LOGS.unshift(enrichedLog);
    if (GLOBAL_ACTIVITY_LOGS.length > MAX_LOGS) {
      GLOBAL_ACTIVITY_LOGS.pop();
    }

    saveLogsToDisk();

    return res.status(200).json({ success: true, id: logData.id });
  } catch (e) {
    console.error('❌ Activity Write Error:', e.message);
    return res.status(500).json({ error: 'Failed to log activity', details: e.message });
  }
};

const handleGetStats = (req, res) => {
  try {
    // FIX: Explicit Content-Type to prevent SPA fallback returning HTML
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(GLOBAL_ACTIVITY_LOGS);
  } catch (e) {
    console.error('❌ Stats Read Error:', e.message);
    return res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

// Register both new and legacy endpoints
app.post('/api/activity/log', handleLogActivity);
app.post('/api/analytics/log', handleLogActivity);

app.get('/api/activity/stats', handleGetStats);
app.get('/api/analytics/stats', handleGetStats);

// =============================================================================
// AI ROUTES
// =============================================================================

// Helper to determine agricultural season
const getSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'Kharif (खरीप)';
  if (month >= 11 || month <= 2) return 'Rabi (रब्बी)';
  return 'Zaid (उन्हाळी)';
};

// Output filtering and disclaimer injection
const filterOutput = (response, lang) => {
  let filtered = response || '';
  if (!filtered) return '';

  const isMarathi = lang === 'mr' || /[\u0900-\u097F]/.test(filtered);

  // 1. Price prediction disclaimer
  const priceKeywords = ['price', 'mandi', 'sell', 'hold', 'bhav', 'भाव', 'बाजार', 'विक्री', 'दर', 'खरेदी'];
  const hasPriceTerms = priceKeywords.some(kw => filtered.toLowerCase().includes(kw));
  if (hasPriceTerms) {
    const disclaimer = isMarathi
      ? "\n\nटीप: बाजारभावाचा अंदाज हे केवळ मार्गदर्शन आहे. प्रत्यक्ष भाव वेगळे असू शकतात."
      : "\n\nNote: Market price predictions are for guidance only. Actual prices may vary.";
    if (!filtered.includes(disclaimer)) {
      filtered += disclaimer;
    }
  }

  // 2. Scheme disclaimer
  const schemeKeywords = ['scheme', 'yojana', 'eligible', 'apply', 'योजना', 'पात्रता', 'अर्ज', 'लाभ'];
  const hasSchemeTerms = schemeKeywords.some(kw => filtered.toLowerCase().includes(kw));
  if (hasSchemeTerms) {
    const disclaimer = isMarathi
      ? "\n\nटीप: योजनांची पात्रता अंतिम नाही. कृपया तहसील कार्यालयात खात्री करा."
      : "\n\nNote: Scheme eligibility is not final. Please verify at your local government office.";
    if (!filtered.includes(disclaimer)) {
      filtered += disclaimer;
    }
  }

  // 3. General AI disclaimer
  const generalDisclaimer = isMarathi
    ? "\n\nटीप: हे AI-आधारित मार्गदर्शन आहे. महत्त्वाच्या निर्णयांसाठी कृषी विज्ञान केंद्राचा सल्ला घ्या."
    : "\n\nNote: This is an AI-based guidance. Consult your nearest KVK for critical farming decisions.";
  if (!filtered.includes(generalDisclaimer)) {
    filtered += generalDisclaimer;
  }

  return filtered;
};

// --- Chat ---
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, systemInstruction, user } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const ai = getAIClient();
    const requestConfig = {};

    let citations = [];
    if (user && typeof user === 'object') {
      // 1. Fetch relevant RAG chunks
      const userCrops = user.crops || (user.crop ? [user.crop] : []);
      const ragResults = await retrieveContext(prompt, {
        crops: userCrops,
        state: user.state || 'maharashtra',
        district: user.district || 'Yavatmal'
      }, API_KEY);

      citations = ragResults.citations;

      // 2. Format the system instruction
      const season = getSeason();
      const compiledInstruction = AGRI_EXPERT_V1
        .replace(/{user_language}/g, user.language || 'mr')
        .replace(/{user_district}/g, user.district || 'Yavatmal')
        .replace(/{user_state}/g, user.state || 'maharashtra')
        .replace(/{user_crops}/g, userCrops.join(', ') || 'कापूस, सोयाबीन')
        .replace(/{user_name}/g, user.name || 'शेतकरी मित्र')
        .replace(/{user_land_size}/g, user.landSize || 'N/A')
        .replace(/{current_season}/g, season)
        .replace(/{weather_summary}/g, 'अंशत: ढगाळ हवामान, मध्यम पावसाची शक्यता')
        .replace(/{rag_context}/g, ragResults.contextText || 'माहिती उपलब्ध नाही.');

      requestConfig.systemInstruction = compiledInstruction;
    } else if (systemInstruction) {
      requestConfig.systemInstruction = systemInstruction;
    }

    const { history } = req.body;
    let contents = [];
    if (Array.isArray(history) && history.length > 0) {
      // Slice to last 10 messages (5 turns max) for token budgeting
      const rollingHistory = history.slice(-10);
      contents = rollingHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || '' }]
      }));
      // Append current prompt if not already present in history
      const lastMsg = rollingHistory[rollingHistory.length - 1];
      if (!lastMsg || lastMsg.text !== prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });

    const filteredText = filterOutput(response.text, user?.language || 'mr');

    return res.json({ 
      text: filteredText,
      citations
    });
  } catch (error) {
    console.error('❌ Chat API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to generate response.', details: error.message });
  }
});

// --- Vision ---
app.post('/api/vision', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, user, cropType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing required field: imageBase64' });
    }

    const ai = getAIClient();
    const requestConfig = {};

    if (user && typeof user === 'object') {
      const season = getSeason();
      const compiledInstruction = DISEASE_DIAGNOSIS_V1
        .replace(/{user_language}/g, user.language || 'mr')
        .replace(/{crop_type}/g, cropType || user.crop || 'cotton')
        .replace(/{user_state}/g, user.state || 'maharashtra')
        .replace(/{current_season}/g, season);

      requestConfig.systemInstruction = compiledInstruction;
      // Request structured output format for diagnosis
      requestConfig.responseMimeType = "application/json";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64
          }
        },
        { text: prompt }
      ],
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });

    let rawText = response.text || '';
    let parsedData = null;
    try {
      parsedData = JSON.parse(rawText.trim());
      if (parsedData && typeof parsedData === 'object') {
        const lang = user?.language || 'mr';
        const disclaimer = lang === 'mr'
          ? "टीप: हे AI-आधारित मार्गदर्शन आहे. महत्त्वाच्या निर्णयांसाठी कृषी विज्ञान केंद्राचा सल्ला घ्या."
          : "Note: This is an AI-based guidance. Consult your nearest KVK for critical farming decisions.";
        parsedData.disclaimer = disclaimer;
        if (parsedData.treatment && typeof parsedData.treatment === 'object') {
          if (typeof parsedData.treatment.immediate === 'string') {
            parsedData.treatment.immediate += ` (${disclaimer})`;
          }
        }
      }
    } catch {
      // Return raw text if JSON parsing fails
    }

    return res.json({ 
      text: rawText,
      data: parsedData
    });
  } catch (error) {
    console.error('❌ Vision API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
  }
});

// --- Soil Health Advisory ---
app.post('/api/soil/advisory', async (req, res) => {
  try {
    const { npk, crop, user } = req.body;
    if (!npk || !crop) {
      return res.status(400).json({ error: 'Missing required field: npk or crop' });
    }

    const ai = getAIClient();
    const soilJson = JSON.stringify(npk);
    
    const compiledInstruction = SOIL_INTERPRETER_V1
      .replace(/{soil_report_json}/g, soilJson)
      .replace(/{next_crop}/g, crop)
      .replace(/{user_district}/g, user?.district || 'Yavatmal')
      .replace(/{user_state}/g, user?.state || 'maharashtra')
      .replace(/{soil_type}/g, user?.soilType || 'black')
      .replace(/{previous_crop}/g, 'None')
      .replace(/{user_language}/g, user?.language || 'mr');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide soil health analysis and NPK suggestions based on: ${soilJson} for ${crop}`,
      config: {
        systemInstruction: compiledInstruction
      }
    });

    const filteredText = filterOutput(response.text, user?.language || 'mr');

    return res.json({
      text: filteredText
    });
  } catch (error) {
    console.error('❌ Soil Advisory API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to generate soil advice.', details: error.message });
  }
});

// --- Weather Crop Advisory ---
app.post('/api/weather/advisory', async (req, res) => {
  try {
    const { user, weatherForecast } = req.body;
    if (!weatherForecast) {
      return res.status(400).json({ error: 'Missing required field: weatherForecast' });
    }

    const ai = getAIClient();
    const weatherJson = JSON.stringify(weatherForecast);

    const compiledInstruction = WEATHER_ADVISORY_V1
      .replace(/{weather_json}/g, weatherJson)
      .replace(/{user_crops}/g, user?.crop || 'cotton')
      .replace(/{user_district}/g, user?.district || 'Yavatmal')
      .replace(/{user_state}/g, user?.state || 'maharashtra')
      .replace(/{irrigation_type}/g, 'Rainfed')
      .replace(/{crop_stage}/g, 'Vegetative Growth')
      .replace(/{user_language}/g, user?.language || 'mr');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate weather crop advisory based on daily weather forecast JSON: ${weatherJson}`,
      config: {
        systemInstruction: compiledInstruction
      }
    });

    const filteredText = filterOutput(response.text, user?.language || 'mr');

    return res.json({
      text: filteredText
    });
  } catch (error) {
    console.error('❌ Weather Advisory API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ error: 'API key invalid or not configured.' });
    }
    return res.status(500).json({ error: 'Failed to generate weather advisory.', details: error.message });
  }
});

// --- Updates (with Google Search grounding) ---
// FIX: This was causing 500 errors due to:
//   1. responseMimeType: "application/json" is incompatible with googleSearch tool
//   2. No fallback when search grounding fails
//   3. response.text may not be valid JSON when using grounding
app.post('/api/updates', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const ai = getAIClient();

    // FIX: Remove responseMimeType when using googleSearch tool.
    // Google Search grounding is incompatible with forced JSON mime type.
    // The model returns plain text/markdown with citations when grounding is active.
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
        // ❌ REMOVED: responseMimeType: "application/json"
        // Reason: Grounding tool responses are NOT valid JSON.
        // Forcing JSON mime type causes the API to return 500/invalid response.
      }
    });

    // FIX: response.text is a string (possibly markdown).
    // Try to parse as JSON if client expects it, otherwise wrap it.
    const rawText = response.text || '';

    // Attempt to extract JSON if model wrapped response in markdown code block
    let parsedData = null;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[1].trim());
      } catch {
        // Not valid JSON inside code block - that's fine
      }
    }

    // If no JSON block found, try parsing the raw text directly
    if (!parsedData) {
      try {
        parsedData = JSON.parse(rawText.trim());
      } catch {
        // Not JSON - return as plain text wrapped in object
        parsedData = null;
      }
    }

    // Return both raw text and parsed data (if available)
    return res.json({
      text: rawText,
      data: parsedData,
      // Include grounding metadata if available
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });

  } catch (error) {
    console.error('❌ Updates API Error:', error.message);

    // FIX: Specific error messages for common failures
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return res.status(401).json({
        error: 'API key invalid or not configured.',
        details: error.message
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later.',
        details: error.message
      });
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(404).json({
        error: 'AI model not found. Check model name.',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch updates.',
      details: error.message
    });
  }
});

// --- Weather Advisory ---
app.post('/api/weather/advisory', async (req, res) => {
  try {
    const { user, weatherForecast } = req.body;
    if (!user || !weatherForecast) {
      return res.status(400).json({ error: 'Missing user or weatherForecast' });
    }
    const ai = getAIClient();
    
    const userCrops = user.crops || (user.crop ? [user.crop] : []);
    const prompt = WEATHER_ADVISORY_V1
      .replace(/{weather_json}/g, JSON.stringify(weatherForecast))
      .replace(/{user_crops}/g, userCrops.join(', ') || 'कापूस, सोयाबीन')
      .replace(/{user_district}/g, user.district || 'Yavatmal')
      .replace(/{user_state}/g, user.state || 'maharashtra')
      .replace(/{irrigation_type}/g, user.irrigationType || 'rainfed')
      .replace(/{crop_stage}/g, 'Growing Stage')
      .replace(/{user_language}/g, user.language || 'mr');
      
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });
    
    return res.json({ text: response.text });
  } catch (error) {
    console.error('❌ Weather Advisory Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate weather advisory', details: error.message });
  }
});

// --- Scheme Matcher ---
app.post('/api/schemes/match', async (req, res) => {
  try {
    const { user, schemes } = req.body;
    if (!user) {
      return res.status(400).json({ error: 'Missing user' });
    }
    const ai = getAIClient();
    
    const userCrops = user.crops || (user.crop ? [user.crop] : []);
    const prompt = SCHEME_MATCHER_V1
      .replace(/{schemes_context}/g, JSON.stringify(schemes || []))
      .replace(/{user_state}/g, user.state || 'maharashtra')
      .replace(/{user_district}/g, user.district || 'Yavatmal')
      .replace(/{user_land_size}/g, user.landSize || '3')
      .replace(/{user_crops}/g, userCrops.join(', ') || 'कापूस, सोयाबीन')
      .replace(/{category_if_known}/g, 'General')
      .replace(/{income_if_known}/g, 'N/A')
      .replace(/{user_language}/g, user.language || 'mr');
      
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });
    
    return res.json({ text: response.text });
  } catch (error) {
    console.error('❌ Scheme Matcher Error:', error.message);
    return res.status(500).json({ error: 'Failed to match schemes', details: error.message });
  }
});

// =============================================================================
// KNOWLEDGE SEARCH ENDPOINT (api-contracts.md — /api/v1/knowledge)
// =============================================================================
app.post('/api/v1/knowledge', rateLimiter(30, 60000), validateBody(['query']), async (req, res) => {
  try {
    const { query, lang, filters } = req.body;
    
    // Use RAG service to retrieve relevant agricultural knowledge chunks
    const ragResults = retrieveContext(query);
    
    // If user wants AI-enhanced summary, call Gemini
    if (req.body.summarize) {
      const ai = getAIClient();
      const contextText = ragResults.map(r => r.text).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Based on this agricultural knowledge base context:\n${contextText}\n\nAnswer this question concisely in ${lang || 'mr'}: ${query}`,
        config: {
          systemInstruction: AGRI_EXPERT_V1
        }
      });
      return res.json({
        text: filterOutput(response.text, lang || 'mr'),
        sources: ragResults.map(r => ({ source: r.source, category: r.category, score: r.score }))
      });
    }
    
    return res.json({
      results: ragResults,
      total: ragResults.length
    });
  } catch (error) {
    console.error('❌ Knowledge Search Error:', error.message);
    return res.status(500).json({ error: 'Knowledge search failed', details: error.message });
  }
});

// =============================================================================
// USER PROFILE ENDPOINT (api-contracts.md — /api/v1/user)
// =============================================================================
app.get('/api/v1/user/:userId', rateLimiter(60, 60000), (req, res) => {
  // In production this would read from Firestore; for now return from localStorage session sync
  const { userId } = req.params;
  if (!userId || userId.length > 128) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  // Return placeholder — real implementation connects to Firestore Admin SDK
  return res.json({
    message: 'User profile endpoint ready. Connect Firestore Admin SDK for production reads.',
    userId,
    status: 'placeholder'
  });
});

app.put('/api/v1/user/:userId', rateLimiter(10, 60000), validateBody(['name', 'village', 'district']), (req, res) => {
  const { userId } = req.params;
  if (!userId || userId.length > 128) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  // Validate profile fields
  const { name, village, district, landSize, crop } = req.body;
  if (name && name.length > 100) return res.status(400).json({ error: 'Name too long (max 100 chars)' });
  if (village && village.length > 100) return res.status(400).json({ error: 'Village name too long' });
  
  // Return placeholder — real implementation writes to Firestore via Admin SDK
  return res.json({
    message: 'User profile update endpoint ready. Connect Firestore Admin SDK for production writes.',
    userId,
    updated: req.body,
    status: 'placeholder'
  });
});

// =============================================================================
// API 404 CATCH-ALL
// Must be AFTER all API routes, BEFORE static file serving
// =============================================================================
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.path,
    method: req.method
  });
});

// =============================================================================
// SERVER & WEBSOCKET SETUP
// =============================================================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 URL: ${isProduction ? 'https' : 'http'}://localhost:${PORT}`);
});

const wss = new WebSocketServer({
  server,
  path: '/ws/live',
  maxPayload: 20 * 1024 * 1024 // 20MB
});

// =============================================================================
// FRONTEND SERVING
// =============================================================================

if (!isProduction) {
  // DEVELOPMENT: Next.js Middleware
  console.log('🔧 Initializing Next.js middleware targeting apps/web...');

  try {
    const { default: next } = await import('next');
    const nextApp = next({ dev: true, dir: path.resolve(__dirname, 'apps/web') });
    const nextHandler = nextApp.getRequestHandler();
    await nextApp.prepare();

    app.use((req, res, nextMiddleware) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/ws')) {
        return nextMiddleware();
      }
      return nextHandler(req, res);
    });

  } catch (e) {
    console.error('❌ Failed to initialize Next.js middleware:', e.message);
  }

} else {
  // PRODUCTION: Serve Built Assets
  const outPath = path.resolve(__dirname, 'apps/web/out');
  console.log(`🚀 Serving static assets from: ${outPath}`);

  if (!fs.existsSync(outPath)) {
    console.error("❌ ERROR: 'apps/web/out' directory not found. Run 'npm run build' first.");
  }

  // Helper: Serve index.html with API key injection
  const serveIndexWithInjection = (req, res) => {
    const isAppRoute = req.path === '/app' || req.path.startsWith('/app/');
    const indexPath = isAppRoute
      ? path.resolve(outPath, 'app/index.html')
      : path.resolve(outPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('Application not built. Run npm run build.');
    }

    try {
      let html = fs.readFileSync(indexPath, 'utf-8');

      // Inject ENV variables for frontend
      const envScript = `<script>
        window.ENV = {
          API_KEY: ${API_KEY ? `"${API_KEY}"` : 'null'}
        };
      </script>`;

      html = html.replace('</head>', `${envScript}</head>`);

      return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e) {
      console.error('❌ Error serving index.html:', e.message);
      return res.status(500).send('Failed to load application.');
    }
  };

  // Serve static files (JS, CSS, images etc.) - exclude index.html
  app.use(express.static(outPath, { index: false }));

  // Return 404 for missing static assets (files with extensions)
  app.use((req, res, next) => {
    const ext = path.extname(req.path);
    if (ext.length > 0 && ext !== '.html') {
      return res.status(404).end();
    }
    next();
  });

  // SPA Fallback - serve index.html for all non-asset routes
  app.get('/', serveIndexWithInjection);
  app.get('/index.html', serveIndexWithInjection);
  app.get('*', serveIndexWithInjection);
}

// =============================================================================
// WEBSOCKET LOGIC
// =============================================================================
wss.on('connection', async (clientWs, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  console.log(`🔗 WS Connected: ${clientId} from ${clientIp}`);

  if (!API_KEY) {
    clientWs.send(JSON.stringify({
      type: 'error',
      error: 'Config Error',
      message: 'API_KEY missing on server'
    }));
    clientWs.close(1008, 'Missing API Key');
    return;
  }

  let ai = getAIClient();
  let session = null;
  let isAlive = true;

  // Heartbeat to detect dead connections
  const heartbeat = setInterval(() => {
    if (!isAlive) {
      console.log(`💀 WS ${clientId}: No heartbeat, terminating.`);
      clearInterval(heartbeat);
      clientWs.terminate();
      return;
    }
    isAlive = false;
    clientWs.ping();
  }, 30000);

  clientWs.on('pong', () => { isAlive = true; });

  clientWs.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      // --- SETUP ---
      if (parsed.type === 'setup') {
        if (session) {
          // Close existing session before creating new one
          try { session.close(); } catch (e) { /* ignore */ }
          session = null;
        }

        const config = parsed.config || {};
        const user = config.user;
        console.log(`⚙️ WS ${clientId}: Setting up session with voice: ${config.voiceName || 'Puck'}`);

        let systemInstructionText = config.systemInstruction || 'You are a helpful assistant.';
        if (user && typeof user === 'object') {
          try {
            const userCrops = user.crops || (user.crop ? [user.crop] : []);
            const ragResults = await retrieveContext('पिकांची माहिती', {
              crops: userCrops,
              state: user.state || 'maharashtra',
              district: user.district || 'Yavatmal'
            }, API_KEY);

            const season = getSeason();
            systemInstructionText = AGRI_EXPERT_V1
              .replace(/{user_language}/g, user.language || 'mr')
              .replace(/{user_district}/g, user.district || 'Yavatmal')
              .replace(/{user_state}/g, user.state || 'maharashtra')
              .replace(/{user_crops}/g, userCrops.join(', ') || 'कापूस, सोयाबीन')
              .replace(/{user_name}/g, user.name || 'शेतकरी मित्र')
              .replace(/{user_land_size}/g, user.landSize || 'N/A')
              .replace(/{current_season}/g, season)
              .replace(/{weather_summary}/g, 'अंशत: ढगाळ हवामान, मध्यम पावसाची शक्यता')
              .replace(/{rag_context}/g, ragResults.contextText || 'माहिती उपलब्ध नाही.');
          } catch (ragErr) {
            console.warn(`⚠️ WS ${clientId}: WebSocket RAG fetch failed:`, ragErr.message);
          }
        }

        try {
          session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: config.voiceName || 'Puck'
                  }
                }
              },
              systemInstruction: {
                parts: [{
                  text: systemInstructionText
                }]
              },
              ...(config.enableInputTranscription && { inputAudioTranscription: {} }),
              ...(config.enableOutputTranscription && { outputAudioTranscription: {} })
            },
            callbacks: {
              onopen: () => {
                console.log(`✅ WS ${clientId}: Gemini session opened`);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'setup_complete' }));
                }
              },
              onmessage: (msg) => {
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify(msg));
                }
              },
              onclose: (evt) => {
                console.log(`🔒 WS ${clientId}: Gemini session closed`, evt?.code);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.close(1000, 'Gemini session closed');
                }
              },
              onerror: (err) => {
                console.error(`❌ WS ${clientId}: Gemini error:`, err?.message || err);
                if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'error',
                    error: 'AI Error',
                    message: err?.message || 'Unknown Gemini error'
                  }));
                }
              }
            }
          });
        } catch (setupErr) {
          console.error(`❌ WS ${clientId}: Session setup failed:`, setupErr.message);
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              error: 'Setup Failed',
              message: setupErr.message
            }));
          }
        }
        return;
      }

      // --- REALTIME INPUT ---
      if (parsed.realtimeInput) {
        if (!session) {
          console.warn(`⚠️ WS ${clientId}: Received audio before setup complete`);
          if (clientWs.readyState === clientWs.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              error: 'Not Ready',
              message: 'Session not initialized. Send setup first.'
            }));
          }
          return;
        }
        session.sendRealtimeInput(parsed.realtimeInput);
      }

    } catch (e) {
      console.error(`❌ WS ${clientId}: Message parse error:`, e.message);
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: 'Parse Error',
          message: 'Invalid message format. Expected JSON.'
        }));
      }
    }
  });

  clientWs.on('close', (code, reason) => {
    clearInterval(heartbeat);
    if (session) {
      try { session.close(); } catch (e) { /* ignore */ }
      session = null;
    }
    console.log(`🔌 WS ${clientId}: Disconnected (code: ${code}, reason: ${reason?.toString() || 'none'})`);
  });

  clientWs.on('error', (err) => {
    console.error(`❌ WS ${clientId}: Socket error:`, err.message);
    clearInterval(heartbeat);
    if (session) {
      try { session.close(); } catch (e) { /* ignore */ }
      session = null;
    }
  });
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

  // Save logs synchronously before exit
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(GLOBAL_ACTIVITY_LOGS, null, 2), 'utf8');
    console.log('💾 Logs saved to disk.');
  } catch (e) {
    console.error('❌ Failed to save logs on shutdown:', e.message);
  }

  // Close all WebSocket connections
  wss.clients.forEach(client => {
    try { client.close(1001, 'Server shutting down'); } catch (e) { /* ignore */ }
  });

  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('❌ Forced exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});