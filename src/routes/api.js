import logger from '../utils/logger.js';
import rateLimiter from '../middleware/rateLimit.middleware.js';
import { 
  AGRI_EXPERT_V1, 
  DISEASE_DIAGNOSIS_V1, 
  WEATHER_ADVISORY_V1, 
  SCHEME_MATCHER_V1, 
  SOIL_INTERPRETER_V1 
} from '../../apps/web/utils/prompts.js';
import { retrieveContext } from '../../apps/web/services/ragService.js';

const MAX_LOGS = 5000;
const MAX_IMAGE_LEN = 10 * 1024 * 1024; // 10MB

// Helper to determine agricultural season
export const getSeason = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'Kharif (खरीप)';
  if (month >= 11 || month <= 2) return 'Rabi (रब्बी)';
  return 'Zaid (उन्हाळी)';
};

// Output filtering and disclaimer injection
export const filterOutput = (response, lang) => {
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
      : "\n\nNote: Scheme eligibility is not final. Please verify at local tehsil office.";
    if (!filtered.includes(disclaimer)) {
      filtered += disclaimer;
    }
  }

  // 3. General medical/chemical disclaimer
  const generalDisclaimer = isMarathi
     ? "\n\nटीप: हे केवळ एआय मार्गदर्शन आहे. कृपया महत्त्वाच्या निर्णयांसाठी जवळच्या कृषी केंद्राशी संपर्क साधा."
     : "\n\nNote: This is an AI-based guidance. Consult your nearest KVK for critical farming decisions.";
  if (!filtered.includes(generalDisclaimer)) {
    filtered += generalDisclaimer;
  }

  return filtered;
};

// Body validator
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

export const initApiRoutes = (app, getAIClient, API_KEY, GLOBAL_ACTIVITY_LOGS, saveLogsToDisk) => {

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      apiKeyConfigured: !!API_KEY,
      environment: process.env.NODE_ENV || 'development',
      logsCount: GLOBAL_ACTIVITY_LOGS.length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Detailed Health Checks
  app.get('/api/health/detailed', async (req, res) => {
    const checkAIConnection = async () => {
      if (!API_KEY) return 'missing_key';
      try {
        const ai = getAIClient();
        await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Ping',
          config: { maxOutputTokens: 5 }
        });
        return 'ok';
      } catch (err) {
        return `failed: ${err.message}`;
      }
    };

    const checks = {
      api_key: API_KEY ? 'ok' : 'missing',
      ai_model: await checkAIConnection(),
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    const allHealthy = checks.api_key === 'ok' && checks.ai_model === 'ok';
    res.status(allHealthy ? 200 : 503).json(checks);
  });

  // Activity / Analytics Logs Write
  const handleLogActivity = (req, res) => {
    try {
      const logData = req.body;
      if (!logData || typeof logData !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }
      if (!logData.sessionId) {
        return res.status(400).json({ error: 'Missing required field: sessionId' });
      }
      if (!logData.userEmail) {
        return res.status(400).json({ error: 'Missing required field: userEmail' });
      }

      const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const ip = rawIp.split(',')[0].trim();

      const enrichedLog = {
        ...logData,
        serverTimestamp: Date.now(),
        ip,
        userAgent: logData.userAgent || req.headers['user-agent'] || 'unknown'
      };

      GLOBAL_ACTIVITY_LOGS.unshift(enrichedLog);
      if (GLOBAL_ACTIVITY_LOGS.length > MAX_LOGS) {
        GLOBAL_ACTIVITY_LOGS.pop();
      }

      saveLogsToDisk();
      return res.status(200).json({ success: true, id: logData.id });
    } catch (e) {
      logger.error('❌ Activity Write Error:', { error: e.message });
      return res.status(500).json({ error: 'Failed to log activity', details: e.message });
    }
  };

  const handleGetStats = (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(GLOBAL_ACTIVITY_LOGS);
    } catch (e) {
      logger.error('❌ Stats Read Error:', { error: e.message });
      return res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  };

  app.post('/api/activity/log', handleLogActivity);
  app.post('/api/analytics/log', handleLogActivity);
  app.get('/api/activity/stats', handleGetStats);
  app.get('/api/analytics/stats', handleGetStats);

  // Support Enquiry
  app.post('/api/support/enquiry', (req, res) => {
    try {
      const { name, phone, village, enquiry, lang } = req.body;
      if (!name || !phone || !enquiry) {
        return res.status(400).json({ error: 'Missing required fields: name, phone, enquiry' });
      }
      const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const ip = rawIp.split(',')[0].trim();

      const supportLog = {
        id: `sup_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'SUPPORT_ENQUIRY',
        userEmail: phone || 'anonymous',
        userName: name,
        village: village || 'N/A',
        enquiry,
        lang: lang || 'mr',
        timestamp: Date.now(),
        serverTimestamp: Date.now(),
        ip,
        userAgent: req.headers['user-agent'] || 'unknown'
      };

      GLOBAL_ACTIVITY_LOGS.unshift(supportLog);
      if (GLOBAL_ACTIVITY_LOGS.length > MAX_LOGS) GLOBAL_ACTIVITY_LOGS.pop();
      saveLogsToDisk();

      logger.info(`📞 Support Enquiry Logged from ${name} (${phone})`);
      return res.status(200).json({ success: true, message: 'Enquiry logged successfully', id: supportLog.id });
    } catch (e) {
      logger.error('❌ Support Enquiry Error:', { error: e.message });
      return res.status(500).json({ error: 'Failed to log support enquiry' });
    }
  });

  // AI Chat
  app.post('/api/chat', rateLimiter(30, 60000), async (req, res) => {
    try {
      const { prompt, systemInstruction, user } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Missing required field: prompt' });
      }

      const ai = getAIClient();
      const requestConfig = {};
      let citations = [];

      if (user && typeof user === 'object') {
        const userCrops = user.crops || (user.crop ? [user.crop] : []);
        const ragResults = await retrieveContext(prompt, {
          crops: userCrops,
          state: user.state || 'maharashtra',
          district: user.district || 'Yavatmal'
        }, API_KEY);

        citations = ragResults.citations;
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
        const rollingHistory = history.slice(-10);
        contents = rollingHistory.map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }]
        }));
        const lastMsg = rollingHistory[rollingHistory.length - 1];
        if (!lastMsg || lastMsg.text !== prompt) {
          contents.push({ role: 'user', parts: [{ text: prompt }] });
        }
      } else {
        contents = prompt;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
      });

      const filteredText = filterOutput(response.text, user?.language || 'mr');
      return res.json({ text: filteredText, citations });
    } catch (error) {
      logger.error('❌ Chat API Error:', { error: error.message });
      if (error.message?.includes('API_KEY')) {
        return res.status(401).json({ error: 'API key invalid or not configured.' });
      }
      return res.status(500).json({ error: 'Failed to generate response.', details: error.message });
    }
  });

  // AI Vision
  app.post('/api/vision', rateLimiter(20, 60000), async (req, res) => {
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
        requestConfig.responseMimeType = "application/json";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
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

      return res.json({ text: rawText, data: parsedData });
    } catch (error) {
      logger.error('❌ Vision API Error:', { error: error.message });
      if (error.message?.includes('API_KEY')) {
        return res.status(401).json({ error: 'API key invalid or not configured.' });
      }
      return res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
    }
  });

  // Soil Health Advisory
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
        model: 'gemini-2.5-flash',
        contents: `Provide soil health analysis and NPK suggestions based on: ${soilJson} for ${crop}`,
        config: { systemInstruction: compiledInstruction }
      });

      const filteredText = filterOutput(response.text, user?.language || 'mr');
      return res.json({ text: filteredText });
    } catch (error) {
      logger.error('❌ Soil Advisory API Error:', { error: error.message });
      return res.status(500).json({ error: 'Failed to generate soil advice.', details: error.message });
    }
  });

  // Weather Advisory
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
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      return res.json({ text: response.text });
    } catch (error) {
      logger.error('❌ Weather Advisory Error:', { error: error.message });
      return res.status(500).json({ error: 'Failed to generate weather advisory', details: error.message });
    }
  });

  // Updates Grounding
  app.post('/api/updates', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Missing required field: prompt' });
      }

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      const rawText = response.text || '';
      let parsedData = null;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[1].trim());
        } catch { /* ignore */ }
      }
      if (!parsedData) {
        try {
          parsedData = JSON.parse(rawText.trim());
        } catch { /* ignore */ }
      }

      return res.json({
        text: rawText,
        data: parsedData,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
      });
    } catch (error) {
      logger.error('❌ Updates API Error:', { error: error.message });
      return res.status(500).json({ error: 'Failed to fetch updates.', details: error.message });
    }
  });

  // Schemes Matcher
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
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      return res.json({ text: response.text });
    } catch (error) {
      logger.error('❌ Scheme Matcher Error:', { error: error.message });
      return res.status(500).json({ error: 'Failed to match schemes', details: error.message });
    }
  });

  // Knowledge RAG Search
  app.post('/api/v1/knowledge', rateLimiter(30, 60000), validateBody(['query']), async (req, res) => {
    try {
      const { query, lang } = req.body;
      const ragResults = retrieveContext(query);
      
      if (req.body.summarize) {
        const ai = getAIClient();
        const contextText = ragResults.map(r => r.text).join('\n');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Based on this agricultural knowledge base context:\n${contextText}\n\nAnswer this question concisely in ${lang || 'mr'}: ${query}`,
          config: { systemInstruction: AGRI_EXPERT_V1 }
        });
        return res.json({
          text: filterOutput(response.text, lang || 'mr'),
          sources: ragResults.map(r => ({ source: r.source, category: r.category, score: r.score }))
        });
      }
      
      return res.json({ results: ragResults, total: ragResults.length });
    } catch (error) {
      logger.error('❌ Knowledge Search Error:', { error: error.message });
      return res.status(500).json({ error: 'Knowledge search failed', details: error.message });
    }
  });

  // User Profile
  app.get('/api/v1/user/:userId', rateLimiter(60, 60000), (req, res) => {
    const { userId } = req.params;
    if (!userId || userId.length > 128) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
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
    const { name, village, district } = req.body;
    if (name && name.length > 100) return res.status(400).json({ error: 'Name too long (max 100 chars)' });
    if (village && village.length > 100) return res.status(400).json({ error: 'Village name too long' });
    
    return res.json({
      message: 'User profile update endpoint ready. Connect Firestore Admin SDK for production writes.',
      userId,
      updated: req.body,
      status: 'placeholder'
    });
  });
};
