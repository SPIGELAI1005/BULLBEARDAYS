/**
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  validateScenarioAnalysis,
  safeValidateScenarioAnalysis,
  validatePartialScenario,
  createFallbackScenario,
  ScenarioAnalysisSchema,
} from '../schemas';

describe('Scenario Validation', () => {
  describe('Complete Valid Scenario', () => {
    it('validates a complete valid scenario', () => {
      const validScenario = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Strong upward momentum with higher highs',
          evidence: [
            'Price broke above resistance',
            'RSI showing bullish divergence',
            'Volume increasing on up moves',
          ],
          keyLevels: {
            support: ['$42,000', '$40,500'],
            resistance: ['$45,000', '$47,200'],
          },
          invalidation: 'Break below $41,500',
          riskNotes: ['Overhead resistance', 'Market correlation risk'],
        },
        bearScenario: {
          thesis: 'Potential rejection at resistance',
          evidence: [
            'Multiple rejections at $45k',
            'Declining volume',
            'Overbought indicators',
          ],
          keyLevels: {
            support: ['$40,000'],
            resistance: ['$45,000'],
          },
          invalidation: 'Break above $45,500',
          riskNotes: ['Strong support below', 'Bullish sentiment'],
        },
        instrument: {
          detected: 'BTC/USDT',
          selected: 'BTC/USDT',
          final: 'BTC/USDT',
          confidence: 95,
        },
        timeframe: {
          detected: '4H',
          selected: '4H',
          final: '4H',
        },
        strategy: 'swingTrader',
        aiModel: 'Google Gemini Pro',
        modelsUsed: ['Google Gemini Pro'],
      };

      const result = safeValidateScenarioAnalysis(validScenario);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.trendBias).toBe('BULLISH');
        expect(result.data.confidenceScore).toBe(75);
      }
    });

    it('validates with optional fields missing', () => {
      const minimalScenario = {
        trendBias: 'NEUTRAL',
        confidenceScore: 50,
        bullScenario: {
          thesis: 'Consolidation pattern forming',
          evidence: ['Sideways price action'],
          invalidation: 'N/A',
          riskNotes: ['Breakout direction unclear'],
        },
        bearScenario: {
          thesis: 'Weakness apparent',
          evidence: ['Lower volume'],
          invalidation: 'N/A',
          riskNotes: ['Support nearby'],
        },
        instrument: {
          final: 'Unknown',
        },
        timeframe: {
          selected: '1D',
          final: '1D',
        },
        strategy: 'swingTrader',
        aiModel: 'AI Assistant',
      };

      const result = safeValidateScenarioAnalysis(minimalScenario);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Scenarios', () => {
    it('rejects invalid trend bias', () => {
      const invalid = {
        trendBias: 'INVALID',
        confidenceScore: 75,
        // ... rest of valid data
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects confidence score > 100', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: 150,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'swingTrader',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors.map((e) => e.path.join('.'));
        expect(errors).toContain('confidenceScore');
      }
    });

    it('rejects confidence score < 0', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: -10,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'swingTrader',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects empty evidence array', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: [], // Empty!
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'swingTrader',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects too many evidence points', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: new Array(15).fill('Evidence'), // Too many!
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'swingTrader',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const invalid = {
        trendBias: 'BULLISH',
        // Missing confidenceScore
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects thesis shorter than 10 characters', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Short', // Too short!
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'swingTrader',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid trading strategy', () => {
      const invalid = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC' },
        timeframe: { selected: '1D', final: '1D' },
        strategy: 'invalidStrategy',
        aiModel: 'Model',
      };

      const result = safeValidateScenarioAnalysis(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Partial Validation', () => {
    it('identifies specific invalid fields', () => {
      const partial = {
        trendBias: 'INVALID',
        confidenceScore: 150,
        bullScenario: {
          thesis: 'Too short',
          evidence: [],
        },
      };

      const result = validatePartialScenario(partial);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      if (!result.valid) {
        const fields = result.errors!.map((e) => e.field);
        expect(fields).toContain('trendBias');
        expect(fields).toContain('confidenceScore');
      }
    });
  });

  describe('Fallback Scenario Generation', () => {
    it('creates valid fallback scenario', () => {
      const fallback = createFallbackScenario('Test error');

      const result = safeValidateScenarioAnalysis(fallback);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.trendBias).toBe('NEUTRAL');
        expect(result.data.confidenceScore).toBe(30);
        expect(result.data.bullScenario.evidence.length).toBeGreaterThan(0);
        expect(result.data.bearScenario.evidence.length).toBeGreaterThan(0);
      }
    });

    it('preserves partial data in fallback', () => {
      const fallback = createFallbackScenario('Test error', {
        instrument: {
          final: 'ETH/USDT',
          selected: 'ETH/USDT',
        },
        strategy: 'dayTrader',
      });

      const result = safeValidateScenarioAnalysis(fallback);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.instrument.final).toBe('ETH/USDT');
        expect(result.data.strategy).toBe('dayTrader');
      }
    });
  });

  describe('Type Guards', () => {
    it('correctly identifies valid scenario', () => {
      const valid = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Strong momentum',
          evidence: ['Evidence 1', 'Evidence 2'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        bearScenario: {
          thesis: 'Potential rejection',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: { final: 'BTC/USDT' },
        timeframe: { selected: '4H', final: '4H' },
        strategy: 'swingTrader',
        aiModel: 'Google Gemini',
      };

      expect(() => validateScenarioAnalysis(valid)).not.toThrow();
    });
  });

  describe('Optional Fields', () => {
    it('accepts undefined optional fields', () => {
      const scenario = {
        trendBias: 'BULLISH',
        confidenceScore: 75,
        bullScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
          // keyLevels is optional
        },
        bearScenario: {
          thesis: 'Valid thesis',
          evidence: ['Evidence 1'],
          invalidation: 'Level',
          riskNotes: ['Risk 1'],
        },
        instrument: {
          final: 'BTC',
          // confidence is optional
        },
        timeframe: {
          selected: '1D',
          final: '1D',
          // detected is optional
        },
        strategy: 'swingTrader',
        aiModel: 'Model',
        // currentPrice, takeProfit, etc. are optional
      };

      const result = safeValidateScenarioAnalysis(scenario);
      expect(result.success).toBe(true);
    });
  });
});
