import { describe, it, expect } from 'vitest';
import { WEATHER_ADVISORY_V1, SCHEME_MATCHER_V1 } from '../utils/prompts.js';

describe('Weather Advisories and Scheme Matching Templates', () => {
  it('correctly replaces weather advisory template parameters', () => {
    const mockUser = {
      district: 'Yavatmal',
      state: 'maharashtra',
      crops: ['cotton'],
      irrigationType: 'drip',
      language: 'mr'
    };

    const mockWeather = {
      temp: '32°C',
      rain: 'heavy rain forecast'
    };

    const compiled = WEATHER_ADVISORY_V1
      .replace(/{weather_json}/g, JSON.stringify(mockWeather))
      .replace(/{user_crops}/g, mockUser.crops.join(', '))
      .replace(/{user_district}/g, mockUser.district)
      .replace(/{user_state}/g, mockUser.state)
      .replace(/{irrigation_type}/g, mockUser.irrigationType)
      .replace(/{crop_stage}/g, 'Growing')
      .replace(/{user_language}/g, mockUser.language);

    expect(compiled).toContain(mockUser.district);
    expect(compiled).toContain(mockUser.state);
    expect(compiled).toContain('heavy rain forecast');
    expect(compiled).toContain('cotton');
  });

  it('correctly replaces scheme matcher template parameters', () => {
    const mockUser = {
      state: 'maharashtra',
      district: 'Yavatmal',
      landSize: '3',
      crops: ['cotton'],
      language: 'mr'
    };

    const mockSchemes = [
      { name: 'PM-KISAN', benefit: '₹6000/year' }
    ];

    const compiled = SCHEME_MATCHER_V1
      .replace(/{schemes_context}/g, JSON.stringify(mockSchemes))
      .replace(/{user_state}/g, mockUser.state)
      .replace(/{user_district}/g, mockUser.district)
      .replace(/{user_land_size}/g, mockUser.landSize)
      .replace(/{user_crops}/g, mockUser.crops.join(', '))
      .replace(/{category_if_known}/g, 'General')
      .replace(/{income_if_known}/g, 'N/A')
      .replace(/{user_language}/g, mockUser.language);

    expect(compiled).toContain(mockUser.state);
    expect(compiled).toContain(mockUser.district);
    expect(compiled).toContain('PM-KISAN');
    expect(compiled).toContain('₹6000/year');
  });
});
