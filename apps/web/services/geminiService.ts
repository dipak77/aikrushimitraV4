
import { GoogleGenAI } from '@google/genai';
import firebaseConfig from '../firebase-applet-config.json';
import { useUserStore } from '../store/useUserStore';

// Initialize lazy GoogleGenAI client for client-side fallback
let clientAI: any = null;
const getClientAI = () => {
  if (!clientAI) {
    const apiKey = getGenAIKey() || firebaseConfig.apiKey || '';
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please configure it in your environment or firebase-applet-config.json.");
    }
    clientAI = new GoogleGenAI({ apiKey });
  }
  return clientAI;
};

import { AIRouter } from '../src/ai/router/AIRouter';
import { RetryPolicy } from '../src/ai/retry/RetryPolicy';
import { TimeoutManager } from '../src/ai/timeout/TimeoutManager';
import { AITelemetry } from '../src/ai/telemetry/AITelemetry';

// Fallback direct call to AI Router when proxy server is unavailable
const callGeminiDirectly = async (endpoint: string, body: any) => {
  const apiKey = getGenAIKey() || firebaseConfig.apiKey || '';
  const startTime = Date.now();
  
  try {
    const res = await RetryPolicy.execute(async () => {
      return await TimeoutManager.withTimeout(async () => {
        if (endpoint === '/api/chat' || endpoint === '/api/support/enquiry') {
          const promptText = body.prompt || body.enquiry || 'Hello';
          const response = await AIRouter.routeChat(promptText, { systemInstruction: body.systemInstruction }, apiKey);
          return response.text;
        }

        if (endpoint === '/api/vision') {
          const response = await AIRouter.routeVision({
            imageBase64: body.imageBase64,
            mimeType: body.mimeType,
            prompt: body.prompt,
            systemInstruction: body.systemInstruction
          }, apiKey);
          return response.text;
        }

        if (endpoint === '/api/updates') {
          const response = await AIRouter.routeSearch(body.prompt, apiKey);
          return response.text;
        }

        const promptText = typeof body === 'string' ? body : JSON.stringify(body);
        const response = await AIRouter.routeChat(promptText, {}, apiKey);
        return response.text;
      }, 20000);
    }, 3, 1000);

    AITelemetry.logMetric({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      task: endpoint,
      latencyMs: Date.now() - startTime,
      success: true
    });

    return res;
  } catch (err: any) {
    AITelemetry.logMetric({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      task: endpoint,
      latencyMs: Date.now() - startTime,
      success: false,
      error: err.message
    });
    throw err;
  }
};

export const getApiUrl = (endpoint: string) => {
  // Always use root-relative endpoints so proxy requests hit Express directly on the active host/port
  return endpoint;
};

// Helper for backend calls with automatic client-side fallback
const postToProxy = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const contentType = response.headers.get("content-type") || '';
    if (!response.ok || contentType.includes("text/html")) {
      throw new Error(`Proxy unavailable or returned HTML fallback (status ${response.status})`);
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.warn(`Proxy failed for ${endpoint}, falling back to direct client-side Gemini API:`, error);
    try {
      return await callGeminiDirectly(endpoint, body);
    } catch (fallbackError) {
      console.error("Client-side Gemini API fallback failed:", fallbackError);
      throw fallbackError;
    }
  }
};

// Function to analyze crop disease from image
export const analyzeCropDisease = async (base64Image: string, lang: string) => {
  try {
    const prompt = lang === 'mr' 
      ? "हे पीक ओळखा आणि एक अनुभवी गावचा जाणकार शेतकरी जसा सल्ला देईल तसा अस्सल ग्रामीण मराठमोळ्या भाषेत सांगा. 'आरं बघा, तुमच्या झाडाला हा असा त्रास झालाय...' अशा भाषेत सुरुवात करा. रोगाचे नाव, नक्की कारण आणि घरगुती जालीम उपाय सांगा. उत्तर खूप लांबलचक नसावे, जसे आपण समोरासमोर गप्पा मारतो तसे सांगा."
      : "Identify this crop and disease. Speak like a friendly local agri-expert. Tell name, cause, and organic remedies in a warm, native conversational tone. Keep it concise as if talking face-to-face.";

    const base64Data = base64Image.split(',')[1];
    const user = useUserStore.getState().user;
    
    return await postToProxy('/api/vision', {
      prompt,
      imageBase64: base64Data,
      user
    });

  } catch (error) {
    return lang === 'mr' ? "फोटो बघताना काहीतरी अडचण आलीया. एकदा परत प्रयत्न करा." : "Error in analysis. Try again.";
  }
};

// Function to get general farming advice via text chat
export const getAIFarmingAdvice = async (query: string, lang: string, cropContext: string, history: any[] = []) => {
  try {
    const systemInstruction = lang === 'mr' 
      ? `तुला 'AI कृषी मित्र' म्हणून बोलायचे आहे. तू रोबोट नाहीस, तर गावातील एक अनुभवी, कष्टाळू आणि प्रेमळ जाणकार शेतकरी आहेस. 
      
      भाषेची शैली:
      - अस्सल ग्रामीण मराठमोळी भाषा वापर (उदा. 'आरं', 'बरं का', 'बघा की', 'लय भारी', 'काळजी नको', 'नक्कीच').
      - शुद्ध आणि पुस्तकी मराठी टाळ. जसं आपण शेताच्या बांधावर बसून गप्पा मारतो, तसं बोल.
      - शेतकरी सध्या ${cropContext} या पिकाची काळजी घेत आहे, हे लक्षात ठेवून सल्ला दे.
      - उत्तरं खूप मोठी देऊ नकोस, ऐकायला जशी गोड वाटतील तशी लहान आणि मुद्देसूद वाक्य बोल.`
      : `You are 'AI Krushi Mitra'. You are a wise, helpful local farmer and expert. 
      
      TONE:
      - Native, warm, and realistic. 
      - Context: Farmer is tending to ${cropContext}.`;

    const user = useUserStore.getState().user;

    return await postToProxy('/api/chat', {
      prompt: query,
      systemInstruction,
      user,
      history
    });

  } catch (error) {
    return lang === 'mr' ? "काहीतरी गडबड झालीये, पुन्हा प्रयत्न करा." : "Something went wrong.";
  }
};

// Function to get soil specific fertilizer recommendations
export const getSoilAdvice = async (npk: {n: number, p: number, k: number}, crop: string, lang: string) => {
    try {
        const user = useUserStore.getState().user;
        return await postToProxy('/api/soil/advisory', { npk, crop, user });
    } catch (e) {
        return "Error fetching advice.";
    }
}

// Function to predict yield
export const predictYield = async (data: any, lang: string) => {
    try {
        const prompt = `Predict crop yield for: 
        Crop: ${data.crop}, 
        Sowing Date: ${data.sowingDate}, 
        Soil: ${data.soilType}, 
        Irrigation: ${data.irrigation}, 
        Area: ${data.area} Acres.
        
        Provide the answer in ${lang === 'mr' ? 'Marathi' : 'English'}.
        Give expected yield range (in Quintals/Tons) and 3 short tips to maximize it.`;
        
        return await postToProxy('/api/chat', { prompt });
    } catch (e) {
        return "Error predicting yield.";
    }
}

// Function to get Live Smart Updates (Schemes, Market, Events)
export const getLiveAgriUpdates = async (lang: string) => {
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
  
  Translate JSON values to ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.`;

  try {
    const text = await postToProxy('/api/updates', { prompt });
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Updates Error:", error);
    return [];
  }
};

// Helper for Live API key injection if client-side logic requires it
export const getGenAIKey = () => {
  // 1. Check for runtime injection
  if (typeof window !== 'undefined' && (window as any).ENV?.API_KEY && (window as any).ENV?.API_KEY !== 'null') {
    return (window as any).ENV.API_KEY;
  }
  
  // 2. Fallback to build-time environment variables
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';
  if (envKey && envKey !== 'CONFIGURE_IN_GCP_SECRET_MANAGER') return envKey;

  // 3. Fallback to firebase applet configuration key
  return firebaseConfig?.apiKey || '';
};
