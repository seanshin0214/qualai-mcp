import { describe, it, expect } from 'vitest';
import { TheoryEngine } from '../src/analysis/theory-engine';
import type { Code } from '../src/analysis/coding-engine';

describe('TheoryEngine', () => {
  const engine = new TheoryEngine();

  describe('buildGroundedTheory', () => {
    it('should build complete grounded theory from codes', async () => {
      const codes: Code[] = [
        { name: 'managing-stress', definition: 'coping strategies', examples: [], frequency: 5, type: 'constructed' },
        { name: 'feeling-anxious', definition: 'anxiety emotions', examples: [], frequency: 4, type: 'in_vivo' },
        { name: 'seeking-support', definition: 'asking for help', examples: [], frequency: 3, type: 'constructed' },
        { name: 'academic-pressure', definition: 'school demands', examples: [], frequency: 4, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'How do students cope with academic stress?',
        paradigm: 'constructivist',
      });

      expect(result.coreCategory).toBeDefined();
      expect(result.coreCategory.name).toBeDefined();
      expect(result.coreCategory.centrality).toBeGreaterThan(0);
      expect(result.supportingCategories.length).toBeGreaterThan(0);
      expect(result.theoreticalFramework).toBeDefined();
      expect(result.storyline).toBeDefined();
      expect(result.stage).toBe('theory_integration');
    });

    it('should identify categories during open coding', async () => {
      const codes: Code[] = [
        { name: 'planning-strategies', definition: 'strategic planning', examples: [], frequency: 3, type: 'constructed' },
        { name: 'organizing-work', definition: 'work organization', examples: [], frequency: 2, type: 'constructed' },
        { name: 'time-managing', definition: 'time management', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'How do professionals manage time?',
        paradigm: 'objectivist',
      });

      // Should group similar codes into categories
      expect(result.supportingCategories.length).toBeGreaterThan(0);
      expect(result.supportingCategories.every(c => c.relatedCodes.length > 0)).toBe(true);
    });

    it('should perform axial coding and find relationships', async () => {
      const codes: Code[] = [
        { name: 'stress-condition', definition: 'stressful conditions', examples: [], frequency: 4, type: 'constructed' },
        { name: 'coping-strategy', definition: 'coping approaches', examples: [], frequency: 3, type: 'constructed' },
        { name: 'positive-outcome', definition: 'beneficial results', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What is the process of adaptation?',
        paradigm: 'constructivist',
      });

      // Core category should have relationships
      expect(result.coreCategory.relationships).toBeDefined();
      expect(result.coreCategory.relationships.length).toBeGreaterThan(0);

      // Relationships should have types
      const relationshipTypes = result.coreCategory.relationships.map(r => r.relationshipType);
      expect(relationshipTypes.length).toBeGreaterThan(0);
    });

    it('should calculate centrality scores correctly', async () => {
      const codes: Code[] = [
        { name: 'central-process', definition: 'main process', examples: [], frequency: 10, type: 'constructed' },
        { name: 'peripheral-factor', definition: 'minor factor', examples: [], frequency: 1, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What is the main process?',
        paradigm: 'constructivist',
      });

      // Core category should have high centrality
      expect(result.coreCategory.centrality).toBeGreaterThan(0);
      expect(result.coreCategory.centrality).toBeLessThanOrEqual(1);
    });

    it('should generate theoretical framework description', async () => {
      const codes: Code[] = [
        { name: 'code-a', definition: 'definition a', examples: [], frequency: 3, type: 'constructed' },
        { name: 'code-b', definition: 'definition b', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'Test question?',
        paradigm: 'objectivist',
      });

      expect(result.theoreticalFramework).toContain(result.coreCategory.name);
      expect(result.theoreticalFramework.length).toBeGreaterThan(100);
    });

    it('should generate storyline with narrative structure', async () => {
      const codes: Code[] = [
        { name: 'initial-condition', definition: 'starting point', examples: [], frequency: 3, type: 'constructed' },
        { name: 'action-taken', definition: 'response', examples: [], frequency: 2, type: 'constructed' },
        { name: 'final-outcome', definition: 'end result', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What is the process of change?',
        paradigm: 'constructivist',
      });

      expect(result.storyline).toBeDefined();
      expect(result.storyline.length).toBeGreaterThan(50);
      expect(result.storyline).toContain('STORYLINE');
    });

    it('should assess theory completeness', async () => {
      const codes: Code[] = [
        { name: 'code1', definition: 'def1', examples: [], frequency: 5, type: 'constructed' },
        { name: 'code2', definition: 'def2', examples: [], frequency: 4, type: 'constructed' },
        { name: 'code3', definition: 'def3', examples: [], frequency: 3, type: 'constructed' },
        { name: 'code4', definition: 'def4', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'Test?',
        paradigm: 'constructivist',
      });

      expect(result.completeness).toBeGreaterThan(0);
      expect(result.completeness).toBeLessThanOrEqual(1);
    });

    it('should provide development recommendations', async () => {
      const codes: Code[] = [
        { name: 'single-code', definition: 'only one', examples: [], frequency: 1, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'Test?',
        paradigm: 'constructivist',
      });

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should generate theoretical memo for core category', async () => {
      const codes: Code[] = [
        { name: 'main-concept', definition: 'central idea', examples: [], frequency: 5, type: 'constructed' },
        { name: 'supporting-concept', definition: 'support', examples: [], frequency: 3, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What is the central phenomenon?',
        paradigm: 'constructivist',
      });

      expect(result.coreCategory.theoreticalMemo).toBeDefined();
      expect(result.coreCategory.theoreticalMemo).toContain('MEMO');
      expect(result.coreCategory.theoreticalMemo.length).toBeGreaterThan(100);
    });

    it('should handle constructivist paradigm', async () => {
      const codes: Code[] = [
        { name: 'experience-code', definition: 'lived experience', examples: [], frequency: 3, type: 'in_vivo' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What is the experience?',
        paradigm: 'constructivist',
      });

      // Constructivist theory should mention participants
      expect(
        result.theoreticalFramework.toLowerCase().includes('participant') ||
        result.storyline.toLowerCase().includes('participant') ||
        result.coreCategory.description.toLowerCase().includes('participant')
      ).toBe(true);
    });

    it('should handle objectivist paradigm', async () => {
      const codes: Code[] = [
        { name: 'observable-pattern', definition: 'observed pattern', examples: [], frequency: 3, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'What patterns exist?',
        paradigm: 'objectivist',
      });

      // Objectivist theory should focus on phenomenon
      expect(
        result.theoreticalFramework.toLowerCase().includes('phenomenon') ||
        result.theoreticalFramework.toLowerCase().includes('analysis') ||
        result.theoreticalFramework.toLowerCase().includes('systematic')
      ).toBe(true);
    });

    it('should identify categories by type', async () => {
      const codes: Code[] = [
        { name: 'managing-task', definition: 'process of managing', examples: [], frequency: 3, type: 'constructed' },
        { name: 'feeling-stressed', definition: 'emotional state', examples: [], frequency: 2, type: 'in_vivo' },
        { name: 'coping-strategy', definition: 'way to cope', examples: [], frequency: 2, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'How do people cope?',
        paradigm: 'constructivist',
      });

      // Should create categories like processes, emotions, strategies
      expect(result.supportingCategories.length).toBeGreaterThan(0);
      const categoryNames = result.supportingCategories.map(c => c.name);
      expect(categoryNames.some(name =>
        name.includes('process') ||
        name.includes('emotion') ||
        name.includes('strateg') ||
        name.includes('challenge') ||
        name.includes('outcome')
      )).toBe(true);
    });

    it('should handle minimal input gracefully', async () => {
      const codes: Code[] = [
        { name: 'single', definition: 'one code', examples: [], frequency: 1, type: 'constructed' },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'Test?',
        paradigm: 'constructivist',
      });

      expect(result).toBeDefined();
      expect(result.coreCategory).toBeDefined();
      expect(result.completeness).toBeLessThan(0.6); // Should be low
      expect(result.recommendations).toContain(expect.stringMatching(/incomplete|continue|more/i));
    });
  });
});
