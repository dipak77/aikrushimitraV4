import { IAIProvider } from '../interfaces/IAIProvider';
import { AIProviderType } from '../types/ai.types';
import { GeminiProvider } from '../providers/gemini/GeminiProvider';
import { OpenAIProvider } from '../providers/openai/OpenAIProvider';
import { ClaudeProvider } from '../providers/claude/ClaudeProvider';
import { GrokProvider } from '../providers/grok/GrokProvider';
import { OllamaProvider } from '../providers/ollama/OllamaProvider';

export class AIProviderFactory {
  private static instances: Map<string, IAIProvider> = new Map();

  static getProvider(type: AIProviderType = 'gemini', apiKey?: string): IAIProvider {
    const cacheKey = `${type}_${apiKey || 'default'}`;
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    let provider: IAIProvider;
    switch (type) {
      case 'gemini':
        provider = new GeminiProvider(apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '');
        break;
      case 'openai':
        provider = new OpenAIProvider(apiKey);
        break;
      case 'claude':
        provider = new ClaudeProvider(apiKey);
        break;
      case 'grok':
        provider = new GrokProvider(apiKey);
        break;
      case 'ollama':
        provider = new OllamaProvider();
        break;
      default:
        provider = new GeminiProvider(apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '');
    }

    this.instances.set(cacheKey, provider);
    return provider;
  }
}
