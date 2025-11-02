/**
 * Theme Engine - Theme extraction and pattern analysis
 */

import type { Code } from './coding-engine.js';

export interface Theme {
  name: string;
  description: string;
  supportingCodes: string[];
  prevalence: number; // 0-1
  examples: string[];
  subThemes?: Theme[];
}

export interface Pattern {
  type: 'sequence' | 'co-occurrence' | 'contrast' | 'hierarchy';
  description: string;
  elements: string[];
  frequency: number;
  significance: 'high' | 'medium' | 'low';
}

export interface SaturationAnalysis {
  level: 'code' | 'theme' | 'theoretical';
  saturated: boolean;
  saturationRate: number; // 0-1
  newCodesPerSource: number[];
  recommendation: string;
}

export class ThemeEngine {
  /**
   * Extract themes from codes
   */
  async extractThemes(params: {
    codes: Code[];
    mode: 'inductive' | 'deductive';
    depth?: 'shallow' | 'medium' | 'deep';
  }): Promise<Theme[]> {
    const { codes, mode, depth = 'medium' } = params;

    if (mode === 'inductive') {
      return this.inductiveThemeExtraction(codes, depth);
    } else {
      return this.deductiveThemeExtraction(codes, depth);
    }
  }

  /**
   * Inductive theme extraction (bottom-up from codes)
   */
  private inductiveThemeExtraction(codes: Code[], depth: string): Theme[] {
    // Group codes by semantic similarity
    const groups = this.groupCodesBySimilarity(codes);

    // Generate themes from groups
    const themes: Theme[] = [];

    for (const [groupName, groupCodes] of groups.entries()) {
      if (groupCodes.length < 2) continue; // Need at least 2 codes for a theme

      const theme: Theme = {
        name: this.generateThemeName(groupCodes),
        description: this.generateThemeDescription(groupCodes),
        supportingCodes: groupCodes.map(c => c.name),
        prevalence: this.calculatePrevalence(groupCodes, codes),
        examples: groupCodes.flatMap(c => c.examples).slice(0, 3),
      };

      // For deep analysis, identify sub-themes
      if (depth === 'deep' && groupCodes.length > 5) {
        theme.subThemes = this.identifySubThemes(groupCodes);
      }

      themes.push(theme);
    }

    // Sort by prevalence
    return themes.sort((a, b) => b.prevalence - a.prevalence);
  }

  /**
   * Deductive theme extraction (top-down from theory)
   */
  private deductiveThemeExtraction(codes: Code[], depth: string): Theme[] {
    // Pre-defined theoretical themes
    const theoreticalFrameworks = [
      {
        name: 'Challenges and Barriers',
        keywords: ['difficult', 'challenge', 'problem', 'barrier', 'obstacle', 'struggle'],
      },
      {
        name: 'Strategies and Solutions',
        keywords: ['solution', 'strategy', 'approach', 'cope', 'manage', 'handle'],
      },
      {
        name: 'Emotional Experiences',
        keywords: ['feel', 'emotion', 'happy', 'sad', 'angry', 'frustrated', 'anxious'],
      },
      {
        name: 'Relationships and Interactions',
        keywords: ['relationship', 'interaction', 'connection', 'communication', 'support'],
      },
      {
        name: 'Identity and Self-Concept',
        keywords: ['identity', 'self', 'who', 'personal', 'individual'],
      },
    ];

    const themes: Theme[] = [];

    for (const framework of theoreticalFrameworks) {
      const matchingCodes = codes.filter(code =>
        framework.keywords.some(keyword =>
          code.name.includes(keyword) || code.definition.toLowerCase().includes(keyword)
        )
      );

      if (matchingCodes.length > 0) {
        themes.push({
          name: framework.name,
          description: `Theme identified through deductive analysis based on theoretical framework`,
          supportingCodes: matchingCodes.map(c => c.name),
          prevalence: this.calculatePrevalence(matchingCodes, codes),
          examples: matchingCodes.flatMap(c => c.examples).slice(0, 3),
        });
      }
    }

    return themes.sort((a, b) => b.prevalence - a.prevalence);
  }

  /**
   * Group codes by semantic similarity
   */
  private groupCodesBySimilarity(codes: Code[]): Map<string, Code[]> {
    const groups = new Map<string, Code[]>();

    for (const code of codes) {
      let foundGroup = false;

      for (const [groupKey, groupCodes] of groups.entries()) {
        if (this.codesAreSimilar(code, groupCodes[0])) {
          groupCodes.push(code);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.set(code.name, [code]);
      }
    }

    return groups;
  }

  /**
   * Check if codes are semantically similar
   */
  private codesAreSimilar(code1: Code, code2: Code): boolean {
    // Check for shared words
    const words1 = code1.name.split(/[-_\s]+/);
    const words2 = code2.name.split(/[-_\s]+/);

    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity > 0.3;
  }

  /**
   * Generate theme name from codes
   */
  private generateThemeName(codes: Code[]): string {
    // Find most common words across codes
    const wordFreq = new Map<string, number>();

    for (const code of codes) {
      const words = code.name.split(/[-_\s]+/);
      for (const word of words) {
        if (word.length > 3) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      }
    }

    // Get top 2-3 words
    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    // Capitalize and join
    return topWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' and ');
  }

  /**
   * Generate theme description
   */
  private generateThemeDescription(codes: Code[]): string {
    const codeNames = codes.map(c => c.name).join(', ');
    return `This theme encompasses ${codes.length} related codes: ${codeNames}. It represents a pattern of meaning across the data.`;
  }

  /**
   * Calculate prevalence (what proportion of all codes this theme covers)
   */
  private calculatePrevalence(themeCodes: Code[], allCodes: Code[]): number {
    const themeFrequency = themeCodes.reduce((sum, c) => sum + c.frequency, 0);
    const totalFrequency = allCodes.reduce((sum, c) => sum + c.frequency, 0);

    return totalFrequency > 0 ? themeFrequency / totalFrequency : 0;
  }

  /**
   * Identify sub-themes within a theme
   */
  private identifySubThemes(codes: Code[]): Theme[] {
    // For now, simple clustering
    const subGroups = this.groupCodesBySimilarity(codes);
    const subThemes: Theme[] = [];

    for (const [groupKey, groupCodes] of subGroups.entries()) {
      if (groupCodes.length >= 2) {
        subThemes.push({
          name: this.generateThemeName(groupCodes),
          description: this.generateThemeDescription(groupCodes),
          supportingCodes: groupCodes.map(c => c.name),
          prevalence: this.calculatePrevalence(groupCodes, codes),
          examples: groupCodes.flatMap(c => c.examples).slice(0, 2),
        });
      }
    }

    return subThemes;
  }

  /**
   * Analyze patterns in the data
   */
  async analyzePatterns(codes: Code[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    // Find co-occurring codes
    const coOccurrences = this.findCoOccurrences(codes);
    patterns.push(...coOccurrences);

    // Find contrasting codes
    const contrasts = this.findContrasts(codes);
    patterns.push(...contrasts);

    // Find hierarchical relationships
    const hierarchies = this.findHierarchies(codes);
    patterns.push(...hierarchies);

    return patterns.sort((a, b) => {
      const sigOrder = { high: 3, medium: 2, low: 1 };
      return sigOrder[b.significance] - sigOrder[a.significance];
    });
  }

  /**
   * Find codes that frequently occur together
   */
  private findCoOccurrences(codes: Code[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Simple approach: codes with shared examples
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const code1 = codes[i];
        const code2 = codes[j];

        const sharedExamples = code1.examples.filter(ex =>
          code2.examples.some(ex2 => ex === ex2 || ex.includes(ex2) || ex2.includes(ex))
        );

        if (sharedExamples.length > 0) {
          patterns.push({
            type: 'co-occurrence',
            description: `"${code1.name}" and "${code2.name}" frequently occur together`,
            elements: [code1.name, code2.name],
            frequency: sharedExamples.length,
            significance: sharedExamples.length > 2 ? 'high' : 'medium',
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Find contrasting codes
   */
  private findContrasts(codes: Code[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Look for opposing concepts
    const oppositions = [
      ['positive', 'negative'],
      ['easy', 'difficult'],
      ['success', 'failure'],
      ['before', 'after'],
      ['challenge', 'solution'],
    ];

    for (const [term1, term2] of oppositions) {
      const codes1 = codes.filter(c => c.name.includes(term1));
      const codes2 = codes.filter(c => c.name.includes(term2));

      if (codes1.length > 0 && codes2.length > 0) {
        patterns.push({
          type: 'contrast',
          description: `Contrast between ${term1} and ${term2} concepts`,
          elements: [...codes1.map(c => c.name), ...codes2.map(c => c.name)],
          frequency: codes1.length + codes2.length,
          significance: 'high',
        });
      }
    }

    return patterns;
  }

  /**
   * Find hierarchical relationships
   */
  private findHierarchies(codes: Code[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Look for parent-child relationships in code names
    for (const code of codes) {
      const potentialChildren = codes.filter(
        c => c !== code && c.name.startsWith(code.name)
      );

      if (potentialChildren.length > 0) {
        patterns.push({
          type: 'hierarchy',
          description: `"${code.name}" is a parent concept with ${potentialChildren.length} sub-categories`,
          elements: [code.name, ...potentialChildren.map(c => c.name)],
          frequency: potentialChildren.length,
          significance: 'medium',
        });
      }
    }

    return patterns;
  }

  /**
   * Detect saturation in the data
   */
  async detectSaturation(params: {
    level: 'code' | 'theme' | 'theoretical';
    codesBySource: Map<string, Code[]>;
  }): Promise<SaturationAnalysis> {
    const { level, codesBySource } = params;

    // Calculate new codes per data source
    const sources = Array.from(codesBySource.keys());
    const newCodesPerSource: number[] = [];
    const seenCodes = new Set<string>();

    for (const source of sources) {
      const sourceCodes = codesBySource.get(source) || [];
      const newCodes = sourceCodes.filter(c => !seenCodes.has(c.name));

      newCodesPerSource.push(newCodes.length);

      // Add to seen
      newCodes.forEach(c => seenCodes.add(c.name));
    }

    // Calculate saturation rate
    const recentSources = newCodesPerSource.slice(-3); // Last 3 sources
    const avgNewCodes = recentSources.reduce((a, b) => a + b, 0) / recentSources.length;
    const saturationRate = 1 - Math.min(avgNewCodes / 5, 1); // Normalize to 0-1

    const saturated = saturationRate > 0.85; // 85% saturation threshold

    let recommendation: string;
    if (saturated) {
      recommendation = `Saturation achieved at ${level} level. You likely have enough data.`;
    } else if (saturationRate > 0.7) {
      recommendation = `Approaching saturation. 2-3 more data sources recommended.`;
    } else {
      recommendation = `Not yet saturated. Continue data collection for robust findings.`;
    }

    return {
      level,
      saturated,
      saturationRate,
      newCodesPerSource,
      recommendation,
    };
  }

  /**
   * Find negative cases (data that contradicts a theme)
   */
  async findNegativeCases(params: {
    theme: Theme;
    allCodes: Code[];
    threshold: 'weak' | 'moderate' | 'strong';
  }): Promise<{
    negativeCases: Array<{
      code: string;
      contradiction: string;
      strength: 'weak' | 'moderate' | 'strong';
    }>;
    recommendation: string;
  }> {
    const { theme, allCodes, threshold } = params;

    const negativeCases: Array<{
      code: string;
      contradiction: string;
      strength: 'weak' | 'moderate' | 'strong';
    }> = [];

    // Look for codes that contradict theme
    const themeName = theme.name.toLowerCase();

    for (const code of allCodes) {
      if (theme.supportingCodes.includes(code.name)) continue;

      const contradiction = this.detectContradiction(themeName, code);

      if (contradiction) {
        negativeCases.push({
          code: code.name,
          contradiction: contradiction.reason,
          strength: contradiction.strength,
        });
      }
    }

    // Filter by threshold
    const filtered = negativeCases.filter(nc => {
      if (threshold === 'weak') return true;
      if (threshold === 'moderate') return nc.strength !== 'weak';
      return nc.strength === 'strong';
    });

    let recommendation: string;
    if (filtered.length === 0) {
      recommendation = 'No significant negative cases found. Theme appears robust.';
    } else if (filtered.length <= 2) {
      recommendation = `${filtered.length} negative case(s) found. Consider refining theme definition to account for these exceptions.`;
    } else {
      recommendation = `${filtered.length} negative cases found. Theme may need significant revision or should be split into multiple themes.`;
    }

    return {
      negativeCases: filtered,
      recommendation,
    };
  }

  /**
   * Detect if a code contradicts a theme
   */
  private detectContradiction(
    themeName: string,
    code: Code
  ): { reason: string; strength: 'weak' | 'moderate' | 'strong' } | null {
    const codeName = code.name.toLowerCase();
    const codeDefinition = code.definition.toLowerCase();

    // Look for opposing terms
    const oppositions = [
      { positive: 'positive', negative: 'negative', strength: 'strong' as const },
      { positive: 'success', negative: 'failure', strength: 'strong' as const },
      { positive: 'easy', negative: 'difficult', strength: 'moderate' as const },
      { positive: 'support', negative: 'obstacle', strength: 'moderate' as const },
      { positive: 'benefit', negative: 'cost', strength: 'moderate' as const },
    ];

    for (const { positive, negative, strength } of oppositions) {
      if (themeName.includes(positive) && (codeName.includes(negative) || codeDefinition.includes(negative))) {
        return {
          reason: `Theme emphasizes "${positive}" but code suggests "${negative}"`,
          strength,
        };
      }
      if (themeName.includes(negative) && (codeName.includes(positive) || codeDefinition.includes(positive))) {
        return {
          reason: `Theme emphasizes "${negative}" but code suggests "${positive}"`,
          strength,
        };
      }
    }

    return null;
  }
}
