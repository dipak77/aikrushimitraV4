export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'grok' | 'ollama';

export interface AIChatOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  history?: any[];
}

export interface AIVisionOptions {
  model?: string;
  imageBase64: string;
  mimeType?: string;
  prompt?: string;
  systemInstruction?: string;
}

export interface AIEmbeddingOptions {
  model?: string;
  text: string;
}

export interface AISearchOptions {
  model?: string;
  query: string;
}

export interface AIProviderResponse {
  text: string;
  raw?: any;
  provider: AIProviderType;
  model: string;
  tokensUsed?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
