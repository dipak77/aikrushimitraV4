import fs from 'fs/promises';
import path from 'path';

export default class ZAI {
  static usePreviewProxy = null;
  static checkPromise = null;

  constructor(config) {
    this.config = config;
  }

  static async checkProxy() {
    if (ZAI.usePreviewProxy !== null) return ZAI.usePreviewProxy;
    if (ZAI.checkPromise) return ZAI.checkPromise;

    ZAI.checkPromise = (async () => {
      try {
        const testUrl = 'https://preview-chat-ada5cc1e-5121-4779-91e2-627014ba78e7.space-z.ai/api/chat';
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }),
          signal: AbortSignal.timeout(1500), // 1.5 seconds timeout
        });
        ZAI.usePreviewProxy = testRes.ok;
        return testRes.ok;
      } catch (err) {
        console.warn('⚠️ Space Z preview endpoint test failed, using local Gemini/Translate:', err.message);
        ZAI.usePreviewProxy = false;
        return false;
      }
    })();

    return ZAI.checkPromise;
  }

  static async create() {
    let apiKey = process.env.GEMINI_API_KEY || '';
    let baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';

    // Try loading from .z-ai-config if exists
    try {
      const configPath = path.join(process.cwd(), '.z-ai-config');
      const configStr = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configStr);
      if (config.apiKey) apiKey = config.apiKey;
      if (config.baseUrl) baseUrl = config.baseUrl;
    } catch {
      // Ignore config file error
    }

    // Trigger check in background
    ZAI.checkProxy().catch(() => {});

    return new ZAI({ baseUrl, apiKey });
  }

  chat = {
    completions: {
      create: async (body) => {
        const useProxy = await ZAI.checkProxy();
        if (useProxy) {
          try {
            const url = 'https://preview-chat-ada5cc1e-5121-4779-91e2-627014ba78e7.space-z.ai/api/chat';
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Space Z preview Chat failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return {
              choices: [
                {
                  message: {
                    content: data.reply || data.text || ''
                  }
                }
              ],
              usage: data.usage
            };
          } catch (err) {
            console.error('⚠️ Proxy chat failed, falling back to local Gemini:', err.message);
            // Mark proxy as failed so we don't try it again for this run
            ZAI.usePreviewProxy = false;
          }
        }

        // Local Gemini fallback with retry loop over multiple models
        const modelsToTry = [
          body.model,
          'gemini-1.5-flash',
          'gemini-2.5-flash',
          'gemini-1.5-pro'
        ].filter(Boolean);

        const uniqueModels = Array.from(new Set(modelsToTry));

        let lastError = null;
        for (const model of uniqueModels) {
          try {
            const requestBody = {
              model: model,
              messages: body.messages || [],
              temperature: body.temperature ?? 0.7,
              max_tokens: body.max_tokens ?? 1000,
            };

            const url = `${this.config.baseUrl}/chat/completions`;
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
              },
              body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Status ${response.status}: ${errorText}`);
            }

            return await response.json();
          } catch (err) {
            console.warn(`⚠️ Gemini model ${model} failed, trying fallback:`, err.message);
            lastError = err;
            continue;
          }
        }

        throw lastError || new Error('All local Gemini models failed');
      }
    }
  };

  audio = {
    tts: {
      create: async (body) => {
        const useProxy = await ZAI.checkProxy();
        if (useProxy) {
          try {
            const url = 'https://preview-chat-ada5cc1e-5121-4779-91e2-627014ba78e7.space-z.ai/api/voice';
            const payload = {
              text: body.input,
              voice: body.voice || 'tongtong',
              speed: body.speed ?? 1.0,
            };
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Space Z preview TTS failed with status ${response.status}: ${errorText}`);
            }

            return response;
          } catch (err) {
            console.error('⚠️ Proxy TTS failed, falling back to local Translate:', err.message);
            ZAI.usePreviewProxy = false;
          }
        }

        // Local Translate TTS fallback
        const text = body.input || '';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        });
        if (!res.ok) {
          throw new Error(`Local TTS failed with status ${res.status}`);
        }
        return res;
      }
    },
    asr: {
      create: async (body) => {
        const useProxy = await ZAI.checkProxy();
        if (useProxy) {
          try {
            const url = 'https://preview-chat-ada5cc1e-5121-4779-91e2-627014ba78e7.space-z.ai/api/asr';
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Space Z preview ASR failed with status ${response.status}: ${errorText}`);
            }

            return await response.json();
          } catch (err) {
            console.error('⚠️ Proxy ASR failed, falling back to mock:', err.message);
            ZAI.usePreviewProxy = false;
          }
        }

        // Local fallback
        return { text: 'मेरे खेत में फसलों की देखभाल कैसे करूं?' };
      }
    }
  };
}
