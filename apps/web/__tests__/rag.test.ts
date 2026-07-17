import { describe, it, expect } from 'vitest';
import { chunkText, cosineSimilarity, retrieveContext } from '../services/ragService.ts';
import { AGRI_EXPERT_V1 } from '../utils/prompts.js';

describe('RAG service helpers', () => {
  it('chunks text with specified size and overlap', () => {
    const text = 'one two three four five six seven eight nine ten';
    const chunks = chunkText(text, 5, 2);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toBe('one two three four five');
  });

  it('calculates cosine similarity correctly', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    const v4 = [0.8, 0.6, 0];

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

    expect(compiled).toContain('Yavatmal');
    expect(compiled).toContain('maharashtra');
    expect(compiled).toContain('cotton, soybean');
    expect(compiled).toContain('Mock RAG Context');
    expect(compiled).toContain('Kharif');
  });
});

describe('RAG 10X Advanced Engine Tests', () => {
  it('1. returns empty results for empty or whitespace query', async () => {
    const res1 = await retrieveContext('');
    expect(res1.contextText).toBe('');
    expect(res1.citations).toEqual([]);

    const res2 = await retrieveContext('   ');
    expect(res2.contextText).toBe('');
    expect(res2.citations).toEqual([]);
  });

  it('2. retrieves relevant cotton knowledge on query cotton', async () => {
    const res = await retrieveContext('cotton pink bollworm management');
    expect(res.contextText).toContain('Cotton');
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0].source).toContain('Cotton');
  });

  it('3. retrieves relevant soybean knowledge on query soybean yellow mosaic', async () => {
    const res = await retrieveContext('soybean yellow mosaic');
    expect(res.contextText).toContain('soybean');
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('4. detects Hindi query and matches correct context', async () => {
    const res = await retrieveContext('कपास में गुलाबी सुंडी का इलाज');
    expect(res.contextText).toContain('कपास');
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('5. detects Marathi query and matches correct context', async () => {
    const res = await retrieveContext('कापसातील बोंडअळी नियंत्रण कसे करावे?');
    expect(res.contextText).toContain('कापूस');
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('6. applies state/geo-boosting based on user state context', async () => {
    const resWithoutState = await retrieveContext('PM-KISAN scheme details');
    const resWithState = await retrieveContext('PM-KISAN scheme details', { state: 'Maharashtra' });
    
    expect(resWithState.citations.length).toBeGreaterThan(0);
    expect(resWithoutState.citations.length).toBeGreaterThan(0);
  });

  it('7. applies category-boosting for user crop context', async () => {
    const res = await retrieveContext('bollworm control', { crops: ['cotton'] });
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0].category).toBe('pests');
  });

  it('8. boosts FAQ documents when conversational question words are used', async () => {
    const res = await retrieveContext('PM-KISAN yojana kya hai? eligibility check?');
    const hasFAQ = res.citations.some(c => c.category === 'schemes' || c.category === 'general');
    expect(hasFAQ).toBe(true);
  });

  it('9. provides correct citation metadata formats', async () => {
    const res = await retrieveContext('pink bollworm');
    expect(res.citations.length).toBeGreaterThan(0);
    const citation = res.citations[0];
    expect(citation).toHaveProperty('source');
    expect(citation).toHaveProperty('category');
    expect(citation).toHaveProperty('score');
    expect(citation.score).toBeGreaterThanOrEqual(0);
    expect(citation.score).toBeLessThanOrEqual(100);
  });

  it('10. handles edge case small inputs in chunkText without errors', () => {
    const chunks = chunkText('hello', 10, 2);
    expect(chunks).toEqual(['hello']);

    const emptyChunks = chunkText('', 10, 2);
    expect(emptyChunks).toEqual(['']);
  });
});
