import { IAIProvider } from '../../interfaces/IAIProvider';
import { AIChatOptions, AIVisionOptions, AIEmbeddingOptions, AISearchOptions, AIProviderResponse, AIProviderType } from '../../types/ai.types';

export class ClaudeProvider implements IAIProvider {
  readonly providerType: AIProviderType = 'claude';
  private apiKey: string;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async chat(prompt: string, options?: AIChatOptions): Promise<AIProviderResponse> {
    const model = options?.model || this.defaultModel;
    return {
      text: `[Anthropic Claude ${model} Response Stub for prompt: "${prompt.slice(0, 30)}..."]`,
      provider: this.providerType,
      model
    };
  }

  async vision(options: AIVisionOptions): Promise<AIProviderResponse> {
    const model = options.model || this.defaultModel;
    return {
      text: `[Anthropic Claude ${model} Vision Response Stub]`,
      provider: this.providerType,
      model
    };
  }

  async embedding(options: AIEmbeddingOptions): Promise<number[]> {
    return new Array(1024).fill(0.02);
  }

  async search(options: AISearchOptions): Promise<AIProviderResponse> {
    return this.chat(options.query, options);
  }

  async json<T = any>(prompt: string, options?: AIChatOptions): Promise<T> {
    const res = await this.chat(prompt, options);
    return { result: res.text } as unknown as T;
  }
}
