import { IAIProvider } from '../../interfaces/IAIProvider';
import { AIChatOptions, AIVisionOptions, AIEmbeddingOptions, AISearchOptions, AIProviderResponse, AIProviderType } from '../../types/ai.types';

export class OllamaProvider implements IAIProvider {
  readonly providerType: AIProviderType = 'ollama';
  private baseUrl: string;
  private defaultModel = 'llama3';

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async chat(prompt: string, options?: AIChatOptions): Promise<AIProviderResponse> {
    const model = options?.model || this.defaultModel;
    return {
      text: `[Ollama Local ${model} Response Stub for prompt: "${prompt.slice(0, 30)}..."]`,
      provider: this.providerType,
      model
    };
  }

  async vision(options: AIVisionOptions): Promise<AIProviderResponse> {
    const model = options.model || 'llava';
    return {
      text: `[Ollama Local Vision ${model} Response Stub]`,
      provider: this.providerType,
      model
    };
  }

  async embedding(options: AIEmbeddingOptions): Promise<number[]> {
    return new Array(4096).fill(0.005);
  }

  async search(options: AISearchOptions): Promise<AIProviderResponse> {
    return this.chat(options.query, options);
  }

  async json<T = any>(prompt: string, options?: AIChatOptions): Promise<T> {
    const res = await this.chat(prompt, options);
    return { result: res.text } as unknown as T;
  }
}
