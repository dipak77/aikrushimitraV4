import { GoogleGenAI } from '@google/genai';
import { IAIProvider } from '../../interfaces/IAIProvider';
import { AIChatOptions, AIVisionOptions, AIEmbeddingOptions, AISearchOptions, AIProviderResponse, AIProviderType } from '../../types/ai.types';

export class GeminiProvider implements IAIProvider {
  readonly providerType: AIProviderType = 'gemini';
  private ai: GoogleGenAI;
  private defaultModel = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required for GeminiProvider initialization.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chat(prompt: string, options?: AIChatOptions): Promise<AIProviderResponse> {
    const model = options?.model || this.defaultModel;
    const requestConfig: any = {};
    if (options?.systemInstruction) {
      requestConfig.systemInstruction = options.systemInstruction;
    }
    if (options?.temperature !== undefined) {
      requestConfig.temperature = options.temperature;
    }

    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });

    return {
      text: response.text || '',
      raw: response,
      provider: this.providerType,
      model
    };
  }

  async vision(options: AIVisionOptions): Promise<AIProviderResponse> {
    const model = options.model || this.defaultModel;
    const requestConfig: any = {};
    if (options.systemInstruction) {
      requestConfig.systemInstruction = options.systemInstruction;
    }

    const response = await this.ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType: options.mimeType || 'image/jpeg',
            data: options.imageBase64
          }
        },
        { text: options.prompt || 'Analyze this agricultural image' }
      ],
      ...(Object.keys(requestConfig).length > 0 && { config: requestConfig })
    });

    return {
      text: response.text || '',
      raw: response,
      provider: this.providerType,
      model
    };
  }

  async embedding(options: AIEmbeddingOptions): Promise<number[]> {
    const model = options.model || 'text-embedding-004';
    const response = await this.ai.models.embedContent({
      model,
      contents: options.text
    });
    const resp = response as any;
    return resp.embeddings?.[0]?.values || resp.embedding?.values || [];
  }

  async search(options: AISearchOptions): Promise<AIProviderResponse> {
    const model = options.model || this.defaultModel;
    const response = await this.ai.models.generateContent({
      model,
      contents: options.query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text || '',
      raw: response,
      provider: this.providerType,
      model
    };
  }

  async json<T = any>(prompt: string, options?: AIChatOptions): Promise<T> {
    const chatRes = await this.chat(prompt, options);
    const text = chatRes.text.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const cleanJson = jsonMatch ? jsonMatch[1].trim() : text;
    return JSON.parse(cleanJson);
  }
}
