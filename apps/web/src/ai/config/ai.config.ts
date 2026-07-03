import { AIProviderType } from '../types/ai.types';

export interface AIConfiguration {
  defaultProvider: AIProviderType;
  defaultModel: string;
  visionModel: string;
  chatModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retryCount: number;
  cacheTTLMs: number;
}

export const aiConfig: AIConfiguration = {
  defaultProvider: 'gemini',
  defaultModel: 'gemini-2.5-flash',
  visionModel: 'gemini-2.5-flash',
  chatModel: 'gemini-2.5-flash',
  embeddingModel: 'text-embedding-004',
  temperature: 0.7,
  maxTokens: 2048,
  timeoutMs: 20000,
  retryCount: 3,
  cacheTTLMs: 3600000 // 1 hour
};
