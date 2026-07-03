import { AIChatOptions, AIVisionOptions, AIEmbeddingOptions, AISearchOptions, AIProviderResponse, AIProviderType } from '../types/ai.types';

export interface IAIProvider {
  readonly providerType: AIProviderType;

  chat(prompt: string, options?: AIChatOptions): Promise<AIProviderResponse>;
  vision(options: AIVisionOptions): Promise<AIProviderResponse>;
  embedding(options: AIEmbeddingOptions): Promise<number[]>;
  search(options: AISearchOptions): Promise<AIProviderResponse>;
  json<T = any>(prompt: string, options?: AIChatOptions): Promise<T>;
}
