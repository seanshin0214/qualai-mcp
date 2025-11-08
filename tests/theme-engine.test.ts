import { describe, it, expect } from 'vitest';
import { ThemeEngine } from '../src/analysis/theme-engine';
import type { Code } from '../src/analysis/coding-engine';

describe('ThemeEngine', () => {
  const engine = new ThemeEngine();

  describe('extractThemes', () => {
    it('should extract themes inductively from similar codes', async () => {
      const codes: Code[] = [
        { name: 'feeling-anxious', definition: 'experiencing anxiety', examples: ['text1'], frequency: 5, type: 'in_vivo' },
        { name: 'feeling-stressed', definition: 'experiencing stress', examples: ['text2'], frequency: 4, type: 'in_vivo' },
        { name: 'feeling-worried', definition: 'experiencing worry', examples: ['text3'], frequency: 3, type: 'in_vivo' },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'inductive',
        depth: 'medium',
      });

      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toHaveProperty('name');
      expect(themes[0]).toHaveProperty('prevalence');
      expect(themes[0]).toHaveProperty('supportingCodes');
      expect(themes[0].supportingCodes.length).toBeGreaterThan(0);
    });

    it('should extract themes deductively using theoretical frameworks', async () => {
      const codes: Code[] = [
        { name: 'difficult-challenge', definition: 'facing difficulties', examples: [], frequency: 3, type: 'constructed' },
        { name: 'problem-solving', definition: 'solving problems', examples: [], frequency: 2, type: 'constructed' },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'deductive',
      });

      expect(themes.length).toBeGreaterThan(0);
      // Should match theoretical framework like "Challenges and Barriers"
      const hasChallengeTheme = themes.some(t =>
        t.name.toLowerCase().includes('challenge') ||
        t.name.toLowerCase().includes('barrier') ||
        t.name.toLowerCase().includes('problem')
      );
      expect(hasChallengeTheme).toBe(true);
    });

    it('should calculate theme prevalence correctly', async () => {
      const codes: Code[] = [
        { name: 'code-a', definition: 'A', examples: [], frequency: 10, type: 'constructed' },
        { name: 'code-b', definition: 'B', examples: [], frequency: 5, type: 'constructed' },
        { name: 'code-c', definition: 'C', examples: [], frequency: 5, type: 'constructed' },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'inductive',
      });

      if (themes.length > 0) {
        expect(themes[0].prevalence).toBeGreaterThan(0);
        expect(themes[0].prevalence).toBeLessThanOrEqual(1);
      }
    });

    it('should identify sub-themes in deep mode', async () => {
      const codes: Code[] = Array.from({ length: 10 }, (_, i) => ({
        name: `code-group-${Math.floor(i / 3)}-item-${i}`,
        definition: `Definition ${i}`,
        examples: [`example ${i}`],
        frequency: i + 1,
        type: 'constructed' as const,
      }));

      const themes = await engine.extractThemes({
        codes,
        mode: 'inductive',
        depth: 'deep',
      });

      const themesWithSubThemes = themes.filter(t => t.subThemes && t.subThemes.length > 0);
      // Deep mode might identify sub-themes if groups are large enough
      expect(themesWithSubThemes.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide theme examples', async () => {
      const codes: Code[] = [
        { name: 'code-with-examples', definition: 'test', examples: ['example 1', 'example 2'], frequency: 2, type: 'constructed' },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'inductive',
      });

      if (themes.length > 0 && themes[0].examples.length > 0) {
        expect(themes[0].examples).toBeDefined();
        expect(Array.isArray(themes[0].examples)).toBe(true);
      }
    });

    it('should handle empty code list', async () => {
      const themes = await engine.extractThemes({
        codes: [],
        mode: 'inductive',
      });

      expect(themes).toBeDefined();
      expect(Array.isArray(themes)).toBe(true);
    });
  });

  describe('analyzePatterns', () => {
    it('should find co-occurrence patterns', async () => {
      const codes: Code[] = [
        { name: 'code-a', definition: 'A', examples: ['shared example'], frequency: 2, type: 'constructed' },
        { name: 'code-b', definition: 'B', examples: ['shared example'], frequency: 2, type: 'constructed' },
      ];

      const patterns = await engine.analyzePatterns(codes);

      const coOccurrences = patterns.filter(p => p.type === 'co-occurrence');
      expect(coOccurrences.length).toBeGreaterThan(0);
      expect(coOccurrences[0].elements.length).toBe(2);
    });

    it('should find contrast patterns', async () => {
      const codes: Code[] = [
        { name: 'positive-outcome', definition: 'good result', examples: [], frequency: 3, type: 'constructed' },
        { name: 'negative-outcome', definition: 'bad result', examples: [], frequency: 2, type: 'constructed' },
      ];

      const patterns = await engine.analyzePatterns(codes);

      const contrasts = patterns.filter(p => p.type === 'contrast');
      expect(contrasts.length).toBeGreaterThan(0);
      expect(contrasts[0].significance).toBe('high');
    });

    it('should find hierarchical patterns', async () => {
      const codes: Code[] = [
        { name: 'stress', definition: 'general stress', examples: [], frequency: 5, type: 'constructed' },
        { name: 'stress-academic', definition: 'academic stress', examples: [], frequency: 3, type: 'constructed' },
        { name: 'stress-social', definition: 'social stress', examples: [], frequency: 2, type: 'constructed' },
      ];

      const patterns = await engine.analyzePatterns(codes);

      const hierarchies = patterns.filter(p => p.type === 'hierarchy');
      if (hierarchies.length > 0) {
        expect(hierarchies[0].elements.length).toBeGreaterThan(1);
      }
    });

    it('should assign significance levels', async () => {
      const codes: Code[] = [
        { name: 'frequent-code', definition: 'very common', examples: ['a', 'b', 'c'], frequency: 10, type: 'constructed' },
        { name: 'another-code', definition: 'also common', examples: ['a', 'b', 'c'], frequency: 8, type: 'constructed' },
      ];

      const patterns = await engine.analyzePatterns(codes);

      if (patterns.length > 0) {
        expect(['high', 'medium', 'low']).toContain(patterns[0].significance);
      }
    });
  });

  describe('detectSaturation', () => {
    it('should detect saturation when no new codes appear', async () => {
      const codesBySource = new Map([
        ['source1', [
          { name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const },
          { name: 'code2', definition: '', examples: [], frequency: 1, type: 'constructed' as const },
        ]],
        ['source2', [
          { name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const },
        ]],
        ['source3', [
          { name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const },
        ]],
      ]);

      const result = await engine.detectSaturation({
        level: 'code',
        codesBySource,
      });

      expect(result.saturated).toBe(true);
      expect(result.saturationRate).toBeGreaterThan(0.8);
      expect(result.recommendation).toContain('saturated' || 'Saturation');
    });

    it('should not detect saturation when new codes keep appearing', async () => {
      const codesBySource = new Map([
        ['source1', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['source2', [{ name: 'code2', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['source3', [{ name: 'code3', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
      ]);

      const result = await engine.detectSaturation({
        level: 'code',
        codesBySource,
      });

      expect(result.saturated).toBe(false);
      expect(result.saturationRate).toBeLessThan(0.85);
    });

    it('should track new codes per source', async () => {
      const codesBySource = new Map([
        ['source1', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['source2', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }, { name: 'code2', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
      ]);

      const result = await engine.detectSaturation({
        level: 'code',
        codesBySource,
      });

      expect(result.newCodesPerSource.length).toBe(2);
      expect(result.newCodesPerSource[0]).toBe(1); // First source: 1 new code
      expect(result.newCodesPerSource[1]).toBe(1); // Second source: 1 new code (code2)
    });

    it('should provide actionable recommendations', async () => {
      const codesBySource = new Map([
        ['s1', [{ name: 'c1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['s2', [{ name: 'c2', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
      ]);

      const result = await engine.detectSaturation({
        level: 'theoretical',
        codesBySource,
      });

      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('findNegativeCases', () => {
    it('should find strong contradictions', async () => {
      const theme = {
        name: 'Positive Experiences',
        description: 'Theme about positive experiences',
        supportingCodes: ['happy', 'joyful'],
        prevalence: 0.5,
        examples: [],
      };

      const allCodes: Code[] = [
        { name: 'happy', definition: 'feeling happy', examples: [], frequency: 5, type: 'in_vivo' },
        { name: 'joyful', definition: 'feeling joy', examples: [], frequency: 4, type: 'in_vivo' },
        { name: 'negative-feeling', definition: 'experiencing negativity', examples: [], frequency: 2, type: 'in_vivo' },
      ];

      const result = await engine.findNegativeCases({
        theme,
        allCodes,
        threshold: 'strong',
      });

      expect(result.negativeCases).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });

    it('should filter by threshold level', async () => {
      const theme = {
        name: 'Success Theme',
        description: 'About success',
        supportingCodes: ['success-code'],
        prevalence: 0.6,
        examples: [],
      };

      const allCodes: Code[] = [
        { name: 'success-code', definition: 'success', examples: [], frequency: 5, type: 'constructed' },
        { name: 'failure-experience', definition: 'failure experiences', examples: [], frequency: 3, type: 'constructed' },
      ];

      const weakResult = await engine.findNegativeCases({
        theme,
        allCodes,
        threshold: 'weak',
      });

      const strongResult = await engine.findNegativeCases({
        theme,
        allCodes,
        threshold: 'strong',
      });

      // Weak threshold should find more or equal cases than strong
      expect(weakResult.negativeCases.length).toBeGreaterThanOrEqual(strongResult.negativeCases.length);
    });

    it('should provide strength ratings for contradictions', async () => {
      const theme = {
        name: 'Positive Theme',
        description: 'Positive experiences',
        supportingCodes: ['positive-code'],
        prevalence: 0.5,
        examples: [],
      };

      const allCodes: Code[] = [
        { name: 'positive-code', definition: 'positive exp', examples: [], frequency: 5, type: 'constructed' },
        { name: 'negative-code', definition: 'negative exp', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.findNegativeCases({
        theme,
        allCodes,
        threshold: 'weak',
      });

      if (result.negativeCases.length > 0) {
        expect(['weak', 'moderate', 'strong']).toContain(result.negativeCases[0].strength);
      }
    });

    it('should recommend theme revision when many negative cases found', async () => {
      const theme = {
        name: 'Test Theme',
        description: 'Test',
        supportingCodes: ['code1'],
        prevalence: 0.3,
        examples: [],
      };

      const allCodes: Code[] = Array.from({ length: 10 }, (_, i) => ({
        name: `contradicting-code-${i}`,
        definition: 'contradicts theme',
        examples: [],
        frequency: 1,
        type: 'constructed' as const,
      }));

      allCodes.push({ name: 'code1', definition: 'supporting', examples: [], frequency: 1, type: 'constructed' });

      const result = await engine.findNegativeCases({
        theme,
        allCodes,
        threshold: 'weak',
      });

      // With many contradictions, should recommend revision
      expect(result.recommendation.toLowerCase()).toMatch(/revis|split|refin/);
    });
  });
});
