import { describe, it, expect } from 'vitest';
import { AIProviderFactory } from '../src/ai/factory/AIProviderFactory';
import { PromptBuilder } from '../src/ai/prompts/builder/PromptBuilder';
import { ChatRequestSchema, VisionRequestSchema } from '../src/ai/schemas/ai.schemas';

describe('Enterprise AI Engine Tests', () => {
  it('instantiates Gemini provider via AIProviderFactory', () => {
    const provider = AIProviderFactory.getProvider('gemini', 'dummy_key');
    expect(provider.providerType).toBe('gemini');
  });

  it('instantiates Claude provider via AIProviderFactory', () => {
    const provider = AIProviderFactory.getProvider('claude');
    expect(provider.providerType).toBe('claude');
  });

  it('compiles system prompts accurately via PromptBuilder', () => {
    const builder = PromptBuilder.create()
      .setSystemPrompt('Hello {user_name} from {user_district}')
      .setContext({ userName: 'Ramesh', district: 'Nashik' });
    
    expect(builder.buildSystemInstruction()).toBe('Hello Ramesh from Nashik');
  });

  it('validates ChatRequest input schemas correctly with Zod', () => {
    const valid = ChatRequestSchema.safeParse({ prompt: 'Tell me about wheat diseases' });
    expect(valid.success).toBe(true);

    const invalid = ChatRequestSchema.safeParse({ prompt: '' });
    expect(invalid.success).toBe(false);
  });
});
