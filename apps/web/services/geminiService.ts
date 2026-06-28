
import { GoogleGenAI } from '@google/genai';
import firebaseConfig from '../firebase-applet-config.json';
import { useUserStore } from '../store/useUserStore';

// Initialize lazy GoogleGenAI client for client-side fallback
let clientAI: any = null;
const getClientAI = () => {
  if (!clientAI) {
    const apiKey = firebaseConfig.apiKey || '';
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please configure it in your environment or firebase-applet-config.json.");
    }
    clientAI = new GoogleGenAI({ apiKey });
  }
  return clientAI;
};

// Fallback direct call to Gemini API when proxy server is unavailable
const callGeminiDirectly = async (endpoint: string, body: any) => {
  const ai = getClientAI();
  
  if (endpoint === '/api/chat') {
    const requestConfig: any = {};
    if (body.systemInstruction) {
      requestConfig.systemInstruction = body.systemInstruction;
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: body.prompt,
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });
    return response.text;
  }
  
  if (endpoint === '/api/vision') {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: body.mimeType || 'image/jpeg',
            data: body.imageBase64
          }
        },
        { text: body.prompt }
      ]
    });
    return response.text;
  }
  
  if (endpoint === '/api/updates') {
    // Grounding with Google Search
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: body.prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  }
  
  throw new Error(`Unsupported direct endpoint: ${endpoint}`);
};

export const getApiUrl = (endpoint: string) => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    if (hostname === 'localhost' && port === '3000') {
      return `http://localhost:5000${endpoint}`;
    }
  }
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
  // 1. Check for runtime injection (Cloud Run / Docker production environment)
  if (typeof window !== 'undefined' && (window as any).ENV?.API_KEY) {
    return (window as any).ENV.API_KEY;
  }
  
  // 2. Fallback to build-time replacement (Vite local development)
  // The logic in vite.config.js ensures this value is populated
  const buildTimeKey = process.env.API_KEY || '';
  if (buildTimeKey) return buildTimeKey;

  // 3. Fallback to firebase applet configuration key
  return firebaseConfig?.apiKey || '';
};
