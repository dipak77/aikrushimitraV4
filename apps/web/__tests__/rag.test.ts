import { describe, it, expect } from 'vitest';
import { chunkText, cosineSimilarity, retrieveContext } from '../services/ragService.js';
import { AGRI_EXPERT_V1 } from '../utils/prompts.js';

describe('RAG service helpers', () => {
  it('chunks text with specified size and overlap', () => {
    const text = 'one two three four five six seven eight nine ten';
    const chunks = chunkText(text, 5, 2);
    // Chunk 1: one two three four five
    // Chunk 2: four five six seven eight
    // Chunk 3: seven eight nine ten
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toBe('one two three four five');
  });

  it('calculates cosine similarity correctly', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    const v4 = [0.8, 0.6, 0]; // normal = 1

    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0.0);
    expect(cosineSimilarity(v1, v4)).toBeCloseTo(0.8);
  });
});

describe('AI prompts validation', () => {
  it('correctly replaces template parameters in prompt library', () => {
    const mockUser = {
      name: 'Ramesh Patel',
      language: 'mr',
      district: 'Yavatmal',
      state: 'maharashtra',
      crops: ['cotton', 'soybean'],
      landSize: '3'
    };

    const compiled = AGRI_EXPERT_V1
      .replace(/{user_language}/g, mockUser.language)
      .replace(/{user_district}/g, mockUser.district)
      .replace(/{user_state}/g, mockUser.state)
      .replace(/{user_crops}/g, mockUser.crops.join(', '))
      .replace(/{user_name}/g, mockUser.name)
      .replace(/{user_land_size}/g, mockUser.landSize)
      .replace(/{current_season}/g, 'Kharif')
      .replace(/{weather_summary}/g, 'sunny')
      .replace(/{rag_context}/g, 'Mock RAG Context');

    expect(compiled).toContain('Ramesh Patel');
    expect(compiled).toContain('Yavatmal');
    expect(compiled).toContain('maharashtra');
    expect(compiled).toContain('cotton, soybean');
    expect(compiled).toContain('Mock RAG Context');
    expect(compiled).toContain('Kharif');
  });
});
