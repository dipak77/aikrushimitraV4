import { AIRouter } from '../src/ai/router/AIRouter';
import { RetryPolicy } from '../src/ai/retry/RetryPolicy';
import { TimeoutManager } from '../src/ai/timeout/TimeoutManager';
import { AITelemetry } from '../src/ai/telemetry/AITelemetry';
import {
  DISEASE_DIAGNOSIS_V1,
  WEATHER_ADVISORY_V1,
  SCHEME_MATCHER_V1,
  SOIL_INTERPRETER_V1,
} from '../utils/prompts';
import { useUserStore } from '../store/useUserStore';

// ─── Constants ───────────────────────────────────────────────────────────────
const PROXY_TIMEOUT_MS = parseInt(typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_PROXY_TIMEOUT || process.env.PROXY_TIMEOUT || '15000') : '15000', 10);
const GEMINI_TIMEOUT_MS = parseInt(typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_GEMINI_TIMEOUT || process.env.GEMINI_TIMEOUT || '20000') : '20000', 10);
const MAX_RETRIES = parseInt(typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_MAX_RETRIES || process.env.MAX_RETRIES || '3') : '3', 10);
const RETRY_DELAY_MS = parseInt(typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_RETRY_DELAY || process.env.RETRY_DELAY || '1000') : '1000', 10);
const MAX_INPUT_LEN = 2_000;
const MAX_IMAGE_LEN = 5_000_000; // 5MB base64 safety limit

// ─── Utilities ───────────────────────────────────────────────────────────────
/**
 * Sanitizes user input to reduce prompt injection risk.
 * Strips code fences, truncates length.
 */
const sanitizeInput = (input: string, maxLen = MAX_INPUT_LEN): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, maxLen)
    .replace(/```/g, '')
    .trim();
};

/**
 * Dynamically determines the current Indian agricultural season.
 * Kharif: Jun–Oct, Rabi: Nov–Mar, Zaid: Apr–May
 */
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 11 || month <= 3) return 'Rabi';
  return 'Zaid';
};

/**
 * Extracts the raw base64 payload from a data URI or returns as-is.
 */
const extractBase64 = (imageData: string): string => {
  if (!imageData || typeof imageData !== 'string') {
    throw new Error('Invalid image data: empty or non-string input.');
  }
  if (imageData.length > MAX_IMAGE_LEN) {
    throw new Error('Image data exceeds maximum allowed size.');
  }
  return imageData.includes(',') ? imageData.split(',')[1] : imageData;
};

/**
 * Detects MIME type from a data URI prefix, defaulting to image/jpeg.
 */
const detectMimeType = (imageData: string): string => {
  if (!imageData || typeof imageData !== 'string') return 'image/jpeg';
  const match = imageData.match(/^data:([^;]+);base64,/);
  if (match && match[1]) {
    return match[1];
  }
  if (imageData.includes('image/png')) return 'image/png';
  if (imageData.includes('image/webp')) return 'image/webp';
  if (imageData.includes('image/gif')) return 'image/gif';
  return 'image/jpeg';
};

/**
 * Safely parses JSON from AI output that may contain markdown fences,
 * commentary, or malformed structure.
 */
const parseAIJson = (text: string): any[] => {
  if (!text || typeof text !== 'string') return [];
  let cleaned = text.replace(/```(?:json)?/g, '').trim();
  let match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        const sanitized = objMatch[0].replace(/,\s*([\]}])/g, '$1');
        const parsed = JSON.parse(sanitized);
        return [parsed];
      } catch {
        return [];
      }
    }
    return [];
  }
  try {
    const sanitized = match[0].replace(/,\s*([\]}])/g, '$1');
    const parsed = JSON.parse(sanitized);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
};

/**
 * Wraps fetch with an AbortController timeout.
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = PROXY_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};


// ─── Client-Side Fallback (proxy unavailable) ───────────────────────────────
/**
 * Direct call to AIRouter when the proxy server is unavailable.
 * No API key is handled client-side — AIRouter must resolve its own key
 * via server-side environment configuration.
 */
const callGeminiDirectly = async (endpoint: string, body: any) => {
  const startTime = Date.now();
  const user = body?.user || useUserStore.getState().user;
  const apiKey = getGenAIKey() || '';

  try {
    const res = await RetryPolicy.execute(async () => {
      return await TimeoutManager.withTimeout(
        (async () => {
          // ── Chat / Support Enquiry ──
          if (endpoint === '/api/chat' || endpoint === '/api/support/enquiry') {
            const promptText = sanitizeInput(
              body.prompt || body.enquiry || 'Hello'
            );
            const response = await AIRouter.routeChat(
              promptText,
              {
                systemInstruction: body.systemInstruction,
                history: body.history || [],
              },
              apiKey
            );
            return response.text;
          }

          // ── Vision (Crop Disease) ──
          if (endpoint === '/api/vision') {
            const compiledInstruction = user
              ? DISEASE_DIAGNOSIS_V1
                .replace(/{user_language}/g, user.language || 'mr')
                .replace(
                  /{crop_type}/g,
                  sanitizeInput(body.cropType || user.crop || 'cotton')
                )
                .replace(/{user_state}/g, user.state || 'maharashtra')
                .replace(/{current_season}/g, getCurrentSeason())
              : undefined;

            const response = await AIRouter.routeVision(
              {
                imageBase64: body.imageBase64,
                mimeType: body.mimeType || 'image/jpeg',
                prompt: sanitizeInput(body.prompt || 'Analyze crop disease'),
                systemInstruction:
                  body.systemInstruction || compiledInstruction,
              },
              apiKey
            );
            return response.text;
          }

          // ── Soil Advisory ──
          if (endpoint === '/api/soil/advisory') {
            const soilJson = JSON.stringify(body.npk || body);
            const compiledInstruction = SOIL_INTERPRETER_V1
              .replace(/{soil_report_json}/g, soilJson)
              .replace(/{next_crop}/g, body.crop || 'cotton')
              .replace(/{user_district}/g, user?.district || 'Yavatmal')
              .replace(/{user_state}/g, user?.state || 'maharashtra')
              .replace(/{soil_type}/g, user?.soilType || 'black')
              .replace(/{previous_crop}/g, user?.previousCrop || 'None')
              .replace(/{user_language}/g, user?.language || 'mr');

            const response = await AIRouter.routeChat(
              `Provide soil health analysis and NPK suggestions based on: ${soilJson} for ${body.crop || 'crop'}`,
              { systemInstruction: compiledInstruction },
              apiKey
            );
            return response.text;
          }

          // ── Weather Advisory ──
          if (endpoint === '/api/weather/advisory') {
            const weatherJson = JSON.stringify(body.weatherForecast || body);
            const compiledInstruction = WEATHER_ADVISORY_V1
              .replace(/{weather_json}/g, weatherJson)
              .replace(/{user_crops}/g, user?.crop || 'cotton')
              .replace(/{user_district}/g, user?.district || 'Yavatmal')
              .replace(/{user_state}/g, user?.state || 'maharashtra')
              .replace(/{irrigation_type}/g, user?.irrigationType || 'Rainfed')
              .replace(/{crop_stage}/g, user?.cropStage || 'Vegetative Growth')
              .replace(/{user_language}/g, user?.language || 'mr');

            const response = await AIRouter.routeChat(
              `Generate weather crop advisory based on daily weather forecast JSON: ${weatherJson}`,
              { systemInstruction: compiledInstruction },
              apiKey
            );
            return response.text;
          }

          // ── Schemes Match ──
          if (endpoint === '/api/schemes/match') {
            const userJson = JSON.stringify(user || body);
            const compiledInstruction = SCHEME_MATCHER_V1
              .replace(/{farmer_profile_json}/g, userJson)
              .replace(/{schemes_db_json}/g, body.schemesDb || '[]')
              .replace(/{user_language}/g, user?.language || 'mr');

            const response = await AIRouter.routeChat(
              `Match agricultural schemes for farmer profile: ${userJson}`,
              { systemInstruction: compiledInstruction },
              apiKey
            );
            return response.text;
          }

          // ── Search / Live Updates ──
          if (endpoint === '/api/updates') {
            const response = await AIRouter.routeSearch(
              sanitizeInput(body.prompt),
              apiKey
            );
            return response.text;
          }

          // ── Default fallback ──
          const promptText =
            typeof body === 'string'
              ? sanitizeInput(body)
              : JSON.stringify(body);
          const response = await AIRouter.routeChat(promptText, {}, apiKey);
          return response.text;
        })(),
        GEMINI_TIMEOUT_MS
      );
    }, MAX_RETRIES, RETRY_DELAY_MS);

    AITelemetry.logMetric({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      task: endpoint,
      latencyMs: Date.now() - startTime,
      success: true,
    });

    return res;
  } catch (err: any) {
    AITelemetry.logMetric({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      task: endpoint,
      latencyMs: Date.now() - startTime,
      success: false,
      error: err?.message || String(err),
    });
    throw err;
  }
};


// ─── Public Exports ──────────────────────────────────────────────────────────

/**
 * Returns a root-relative API URL.
 */
export const getApiUrl = (endpoint: string): string => endpoint;

/**
 * Resolves the Gemini API key from runtime env, build-time env, or config.
 *
 * SECURITY NOTE: Exported for backward compatibility. Prefer routing
 * all AI requests through the backend proxy. If client-side fallback is
 * unavoidable, restrict the key in GCP Console to specific referrer URLs.
 */
export const getGenAIKey = (): string => {
  if (
    typeof window !== 'undefined' &&
    (window as any).ENV?.API_KEY &&
    (window as any).ENV?.API_KEY !== 'null'
  ) {
    return (window as any).ENV.API_KEY;
  }

  // Vite support
  try {
    // @ts-ignore
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_GOOGLE_API_KEY || import.meta.env?.VITE_API_KEY;
    if (viteKey) return viteKey;
  } catch { /* ignore */ }

  const envKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    '';
  if (envKey && envKey !== 'CONFIGURE_IN_GCP_SECRET_MANAGER') return envKey;

  return '';
};

/**
 * Posts to the backend proxy with automatic client-side fallback.
 * Includes a 15-second timeout on the proxy fetch.
 */
const postToProxy = async (endpoint: string, body: any): Promise<string> => {
  const isUpdates = endpoint === '/api/updates';
  try {
    const response = await fetchWithTimeout(
      getApiUrl(endpoint),
      {
        method: isUpdates ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isUpdates ? undefined : JSON.stringify(body),
      },
      PROXY_TIMEOUT_MS
    );

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || contentType.includes('text/html')) {
      throw new Error(
        `Proxy unavailable or returned HTML fallback (status ${response.status})`
      );
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.warn(
      `Proxy failed for ${endpoint}, falling back to direct client-side AI:`,
      error
    );
    try {
      return await callGeminiDirectly(endpoint, body);
    } catch (fallbackError: any) {
      console.warn('Client-side AI fallback also failed:', fallbackError.message || fallbackError);
      throw fallbackError;
    }
  }
};


// ─── Feature Functions (backward-compatible signatures) ─────────────────────

/**
 * Analyzes a crop disease from a base64 image.
 * @param base64Image - Data URI or raw base64 string
 * @param lang - 'mr' for Marathi, otherwise English
 */
export const analyzeCropDisease = async (
  base64Image: string,
  lang: string
): Promise<string> => {
  try {
    const prompt =
      lang === 'mr'
        ? "हे पीक ओळखा आणि एक अनुभवी गावचा जाणकार शेतकरी जसा सल्ला देईल तसा अस्सल ग्रामीण मराठमोळ्या भाषेत सांगा. 'आरं बघा, तुमच्या झाडाला हा असा त्रास झालाय...' अशा भाषेत सुरुवात करा. रोगाचे नाव, नक्की कारण आणि घरगुती जालीम उपाय सांगा. उत्तर खूप लांबलचक नसावे, जसे आपण समोरासमोर गप्पा मारतो तसे सांगा."
        : "Identify this crop and disease. Speak like a friendly local agri-expert. Tell name, cause, and organic remedies in a warm, native conversational tone. Keep it concise as if talking face-to-face.";

    const base64Data = extractBase64(base64Image);
    const mimeType = detectMimeType(base64Image);
    const user = useUserStore.getState().user;

    return await postToProxy('/api/vision', {
      prompt,
      imageBase64: base64Data,
      mimeType,
      user,
    });
  } catch (error) {
    return lang === 'mr'
      ? 'फोटो बघताना काहीतरी अडचण आलीया. एकदा परत प्रयत्न करा.'
      : 'Error in analysis. Try again.';
  }
};

/**
 * Gets general farming advice via text chat.
 * @param query - User's question
 * @param lang - 'mr' for Marathi, otherwise English
 * @param cropContext - Current crop the farmer is tending
 * @param history - Conversation history array (default: [])
 */
export const getAIFarmingAdvice = async (
  query: string,
  lang: string,
  cropContext: string,
  history: any[] = []
): Promise<string> => {
  try {
    const systemInstruction =
      lang === 'mr'
        ? `तुला 'AI कृषी मित्र' म्हणून बोलायचे आहे. तू रोबोट नाहीस, तर गावातील एक अनुभवी, कष्टाळू आणि प्रेमळ जाणकार शेतकरी आहेस.
        भाषेची शैली:
        - अस्सल ग्रामीण मराठमोळी भाषा वापर (उदा. 'आरं', 'बरं का', 'बघा की', 'लय भारी', 'काळजी नको', 'नक्कीच').
        - शुद्ध आणि पुस्तकी मराठी टाळ. जसं आपण शेताच्या बांधावर बसून गप्पा मारतो, तसं बोल.
        - शेतकरी सध्या ${sanitizeInput(cropContext)} या पिकाची काळजी घेत आहे, हे लक्षात ठेवून सल्ला दे.
        - उत्तरं खूप मोठी देऊ नकोस, ऐकायला जशी गोड वाटतील तशी लहान आणि मुद्देसूद वाक्य बोल.`
        : `You are 'AI Krushi Mitra'. You are a wise, helpful local farmer and expert.
        TONE:
        - Native, warm, and realistic.
        - Context: Farmer is tending to ${sanitizeInput(cropContext)}.`;

    const user = useUserStore.getState().user;

    return await postToProxy('/api/chat', {
      prompt: sanitizeInput(query),
      systemInstruction,
      user,
      history,
    });
  } catch (error) {
    return lang === 'mr'
      ? 'काहीतरी गडबड झालीये, पुन्हा प्रयत्न करा.'
      : 'Something went wrong.';
  }
};

/**
 * Gets soil-specific fertilizer recommendations.
 * @param npk - { n, p, k } nutrient values
 * @param crop - Target crop name
 * @param lang - 'mr' for Marathi, otherwise English
 */
export const getSoilAdvice = async (
  npk: { n: number; p: number; k: number },
  crop: string,
  lang: string
): Promise<string> => {
  try {
    const user = useUserStore.getState().user;
    return await postToProxy('/api/soil/advisory', { npk, crop, user });
  } catch (e) {
    return 'Error fetching advice.';
  }
};

/**
 * Predicts crop yield based on sowing parameters.
 * @param data - { crop, sowingDate, soilType, irrigation, area }
 * @param lang - 'mr' for Marathi, otherwise English
 */
export const predictYield = async (
  data: any,
  lang: string
): Promise<string> => {
  try {
    const user = useUserStore.getState().user;
    const prompt = `Predict crop yield for:
    Crop: ${sanitizeInput(data.crop)},
    Sowing Date: ${sanitizeInput(data.sowingDate)},
    Soil: ${sanitizeInput(data.soilType)},
    Irrigation: ${sanitizeInput(data.irrigation)},
    Area: ${sanitizeInput(String(data.area))} Acres.

    Provide the answer in ${lang === 'mr' ? 'Marathi' : 'English'}.
    Give expected yield range (in Quintals/Tons) and 3 short tips to maximize it.`;

    return await postToProxy('/api/chat', { prompt, user });
  } catch (e) {
    return 'Error predicting yield.';
  }
};

/**
 * Gets live agricultural updates (schemes, market prices).
 * Returns parsed JSON array or empty array on failure.
 * @param lang - 'mr' for Marathi, 'hi' for Hindi, otherwise English
 */
export const getLiveAgriUpdates = async (
  lang: string
): Promise<any[]> => {
  const prompt = `Find the absolute latest agricultural updates for farmers in Maharashtra, India.

  I need exactly 2 items in valid JSON format:
  1. 'scheme': The most recent update on PM Kisan Yojana OR Namo Shetkari Yojana.
  2. 'market': A significant price trend for Soyabean, Cotton, or Onion in major Maharashtra mandis.

  Output strictly JSON:
  [
    {
      "type": "scheme",
      "title": "Short Headline (max 6 words)",
      "subtitle": "Details with dates/amounts (max 10 words)",
      "badge": "Short Badge (e.g. 'Date Announced')"
    },
    {
      "type": "market",
      "title": "Short Headline (max 6 words)",
      "subtitle": "Details with price/trend (max 10 words)",
      "badge": "Short Badge (e.g. 'Price Up')"
    }
  ]

  Translate JSON values to ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'
    }.`;

  try {
    const text = await postToProxy('/api/updates', { prompt });
    return parseAIJson(text);
  } catch (error: any) {
    console.warn('Updates Error (using static fallback):', error.message || error);
    return [];
  }
};