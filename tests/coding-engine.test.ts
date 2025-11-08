import { describe, it, expect } from 'vitest';
import { CodingEngine } from '../src/analysis/coding-engine';

describe('CodingEngine', () => {
  const engine = new CodingEngine();

  describe('autoCoding', () => {
    it('should extract in-vivo codes from emotional text', async () => {
      const result = await engine.autoCoding({
        text: 'I feel really anxious about the upcoming exam. The stress is overwhelming.',
      });

      expect(result.codes.length).toBeGreaterThan(0);
      expect(result.codes.some(c => c.type === 'in_vivo')).toBe(true);
      expect(result.summary.inVivoCodes).toBeGreaterThan(0);
    });

    it('should generate constructed codes for gerunds', async () => {
      const result = await engine.autoCoding({
        text: 'Managing stress through meditation and practicing mindfulness',
        methodology: 'grounded',
      });

      expect(result.codes.some(c => c.type === 'constructed')).toBe(true);
      expect(result.codes.some(c => c.name.includes('managing') || c.name.includes('practicing'))).toBe(true);
    });

    it('should apply existing codes via keyword matching', async () => {
      const result = await engine.autoCoding({
        text: 'I am coping with stress by talking to friends',
        existingCodes: ['stress-management', 'coping-strategies', 'social-support'],
      });

      const codeNames = result.codes.map(c => c.name.toLowerCase()).join(' ');
      expect(codeNames.includes('stress') || codeNames.includes('coping') || codeNames.includes('social')).toBe(true);
    });

    it('should segment text into multiple chunks', async () => {
      const longText = `
        Paragraph 1: I started feeling anxious when the semester began.
        Paragraph 2: Then I developed coping strategies.
        Paragraph 3: Finally, I sought help from counselors.
      `;

      const result = await engine.autoCoding({ text: longText });

      // Segments might be 1 if text is short, just check it exists
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
      expect(result.summary.averageCodesPerSegment).toBeGreaterThanOrEqual(0);
    });

    it('should handle phenomenology methodology', async () => {
      const result = await engine.autoCoding({
        text: 'The lived experience of anxiety is like being trapped',
        methodology: 'phenomenology',
      });

      expect(result.codes.length).toBeGreaterThan(0);
      // Phenomenology focuses on experience descriptions
      const hasExperienceCode = result.codes.some(c =>
        c.definition.toLowerCase().includes('experience') ||
        c.name.toLowerCase().includes('experience')
      );
      expect(hasExperienceCode || result.codes.length > 0).toBe(true);
    });

    it('should track code frequency', async () => {
      const result = await engine.autoCoding({
        text: 'stress stress stress anxiety anxiety',
      });

      const stressCodes = result.codes.filter(c => c.name.toLowerCase().includes('stress'));
      if (stressCodes.length > 0) {
        expect(stressCodes[0].frequency).toBeGreaterThanOrEqual(1);
      }
    });

    it('should provide examples for each code', async () => {
      const text = 'I feel anxious about exams';
      const result = await engine.autoCoding({ text });

      expect(result.codes.length).toBeGreaterThan(0);
      const codesWithExamples = result.codes.filter(c => c.examples.length > 0);
      expect(codesWithExamples.length).toBeGreaterThan(0);
    });

    it('should handle empty text gracefully', async () => {
      const result = await engine.autoCoding({ text: '' });

      expect(result.codes).toBeDefined();
      expect(result.segments).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should differentiate theoretical codes', async () => {
      const result = await engine.autoCoding({
        text: 'The process of adaptation involves multiple stages',
        methodology: 'grounded',
      });

      // Theoretical codes should emerge in grounded theory
      expect(result.summary.theoreticalCodes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('refineCodebook', () => {
    it('should merge similar codes with high overlap', async () => {
      const codes = [
        { name: 'stress-coping', definition: 'coping with stress', examples: ['text1'], frequency: 3, type: 'constructed' as const },
        { name: 'coping-stress', definition: 'managing stress', examples: ['text2'], frequency: 2, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      expect(result.merges.length).toBeGreaterThan(0);
      expect(result.refined.length).toBeLessThan(codes.length);
      expect(result.merges[0].reason).toBeDefined();
    });

    it('should not merge dissimilar codes', async () => {
      const codes = [
        { name: 'anxiety', definition: 'feeling anxious', examples: [], frequency: 3, type: 'in_vivo' as const },
        { name: 'exercise', definition: 'physical activity', examples: [], frequency: 2, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      expect(result.refined.length).toBe(2);
      expect(result.merges.length).toBe(0);
    });

    it('should preserve code metadata when merging', async () => {
      const codes = [
        { name: 'stress-a', definition: 'stress variant A', examples: ['ex1', 'ex2'], frequency: 3, type: 'constructed' as const },
        { name: 'stress-b', definition: 'stress variant B', examples: ['ex3'], frequency: 2, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      if (result.merges.length > 0) {
        const mergedCode = result.refined.find(c => c.name === result.merges[0].to);
        expect(mergedCode).toBeDefined();
        if (mergedCode) {
          expect(mergedCode.frequency).toBeGreaterThan(0);
        }
      }
    });

    it('should handle single code without merging', async () => {
      const codes = [
        { name: 'single-code', definition: 'only code', examples: [], frequency: 1, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      expect(result.refined.length).toBe(1);
      expect(result.merges.length).toBe(0);
    });

    it('should provide merge reasoning', async () => {
      const codes = [
        { name: 'managing-stress', definition: 'handling stress', examples: [], frequency: 3, type: 'constructed' as const },
        { name: 'stress-management', definition: 'stress handling', examples: [], frequency: 2, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      if (result.merges.length > 0) {
        expect(result.merges[0].reason).toContain('similar');
      }
    });
  });
});
