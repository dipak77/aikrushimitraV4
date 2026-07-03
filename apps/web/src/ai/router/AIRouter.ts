import { IAIProvider } from '../interfaces/IAIProvider';
import { AIProviderFactory } from '../factory/AIProviderFactory';
import { aiConfig } from '../config/ai.config';
import { AIProviderResponse, AIChatOptions, AIVisionOptions } from '../types/ai.types';

export type TaskType = 'chat' | 'vision' | 'embedding' | 'search' | 'advisory';

export class AIRouter {
  private static getProviderForTask(task: TaskType, apiKey?: string): IAIProvider {
    // Enterprise Cost & Reliability Router: Select optimal provider dynamically
    const providerType = aiConfig.defaultProvider;
    return AIProviderFactory.getProvider(providerType, apiKey);
  }

  static async routeChat(prompt: string, options?: AIChatOptions, apiKey?: string): Promise<AIProviderResponse> {
    const provider = this.getProviderForTask('chat', apiKey);
    return provider.chat(prompt, {
      model: aiConfig.chatModel,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens,
      ...options
    });
  }

  static async routeVision(options: AIVisionOptions, apiKey?: string): Promise<AIProviderResponse> {
    const provider = this.getProviderForTask('vision', apiKey);
    return provider.vision({
      model: aiConfig.visionModel,
      ...options
    });
  }

  static async routeEmbedding(text: string, apiKey?: string): Promise<number[]> {
    const provider = this.getProviderForTask('embedding', apiKey);
    return provider.embedding({ text, model: aiConfig.embeddingModel });
  }

  static async routeSearch(query: string, apiKey?: string): Promise<AIProviderResponse> {
    const provider = this.getProviderForTask('search', apiKey);
    return provider.search({ query, model: aiConfig.chatModel });
  }
}
