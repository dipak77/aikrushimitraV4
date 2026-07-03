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

    const getEnvKey = () => {
      try {
        // @ts-ignore
        const viteKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_GOOGLE_API_KEY || import.meta.env?.VITE_API_KEY;
        if (viteKey) return viteKey;
      } catch { /* ignore */ }
      
      return process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
             process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
             process.env.NEXT_PUBLIC_API_KEY ||
             process.env.GEMINI_API_KEY || 
             process.env.GOOGLE_API_KEY || 
             process.env.API_KEY || 
             '';
    };

    const resolvedKey = apiKey || getEnvKey();

    let provider: IAIProvider;
    switch (type) {
      case 'gemini':
        provider = new GeminiProvider(resolvedKey);
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
        provider = new GeminiProvider(resolvedKey);
    }

    this.instances.set(cacheKey, provider);
    return provider;
  }
}
