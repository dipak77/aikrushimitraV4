import { z } from 'zod';

export class ResponseValidator {
  static validateAndRepair<T>(rawText: string, schema: z.ZodSchema<T>): T {
    let cleanText = rawText.trim();
    
    // Extract JSON if wrapped in markdown code blocks
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      cleanText = jsonMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(cleanText);
      return schema.parse(parsed);
    } catch (err) {
      console.warn('⚠️ Response validation failed, returning raw fallback object:', err);
      return { rawText } as unknown as T;
    }
  }
}
