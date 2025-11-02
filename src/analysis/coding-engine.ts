/**
 * Coding Engine - Automatic coding and code management
 */

export interface Code {
  name: string;
  definition: string;
  examples: string[];
  frequency: number;
  type: 'in_vivo' | 'constructed' | 'theoretical';
}

export interface CodingResult {
  codes: Code[];
  segments: Array<{
    text: string;
    codes: string[];
    startIndex: number;
    endIndex: number;
  }>;
  summary: {
    totalCodes: number;
    inVivoCodes: number;
    constructedCodes: number;
    theoreticalCodes: number;
    averageCodesPerSegment: number;
  };
}

export class CodingEngine {
  /**
   * Automatically code text based on methodology
   */
  async autoCoding(params: {
    text: string;
    existingCodes?: string[];
    methodology?: string;
  }): Promise<CodingResult> {
    const { text, existingCodes = [], methodology = 'general' } = params;

    // Split text into meaningful segments (sentences/paragraphs)
    const segments = this.segmentText(text);

    // Generate codes for each segment
    const allCodes = new Map<string, Code>();
    const codedSegments: CodingResult['segments'] = [];

    for (const segment of segments) {
      const segmentCodes = this.generateCodesForSegment(segment.text, methodology, existingCodes);

      // Accumulate codes
      for (const code of segmentCodes) {
        if (allCodes.has(code.name)) {
          const existing = allCodes.get(code.name)!;
          existing.frequency++;
          existing.examples.push(segment.text.substring(0, 100) + '...');
        } else {
          allCodes.set(code.name, code);
        }
      }

      codedSegments.push({
        text: segment.text,
        codes: segmentCodes.map(c => c.name),
        startIndex: segment.start,
        endIndex: segment.end,
      });
    }

    const codes = Array.from(allCodes.values());
    const summary = this.generateSummary(codes, codedSegments);

    return {
      codes,
      segments: codedSegments,
      summary,
    };
  }

  /**
   * Segment text into codeable units
   */
  private segmentText(text: string): Array<{ text: string; start: number; end: number }> {
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);
    const segments: Array<{ text: string; start: number; end: number }> = [];
    let currentIndex = 0;

    for (const para of paragraphs) {
      if (para.trim().length === 0) continue;

      // For long paragraphs, split by sentences
      if (para.length > 500) {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        for (const sentence of sentences) {
          const trimmed = sentence.trim();
          if (trimmed.length > 0) {
            segments.push({
              text: trimmed,
              start: currentIndex,
              end: currentIndex + trimmed.length,
            });
            currentIndex += sentence.length;
          }
        }
      } else {
        segments.push({
          text: para.trim(),
          start: currentIndex,
          end: currentIndex + para.length,
        });
        currentIndex += para.length + 2; // +2 for \n\n
      }
    }

    return segments;
  }

  /**
   * Generate codes for a text segment based on methodology
   */
  private generateCodesForSegment(
    text: string,
    methodology: string,
    existingCodes: string[]
  ): Code[] {
    const codes: Code[] = [];

    // Extract in-vivo codes (participant's own words)
    const inVivoCodes = this.extractInVivoCodes(text);
    codes.push(...inVivoCodes);

    // Generate constructed codes based on methodology
    const constructedCodes = this.generateConstructedCodes(text, methodology);
    codes.push(...constructedCodes);

    // Check if existing codes apply
    for (const existingCode of existingCodes) {
      if (this.codeApplies(text, existingCode)) {
        codes.push({
          name: existingCode,
          definition: 'Existing code from codebook',
          examples: [text.substring(0, 100) + '...'],
          frequency: 1,
          type: 'constructed',
        });
      }
    }

    return codes;
  }

  /**
   * Extract in-vivo codes (direct quotes)
   */
  private extractInVivoCodes(text: string): Code[] {
    const codes: Code[] = [];

    // Look for quoted phrases or distinctive participant language
    const quotes = text.match(/"([^"]+)"/g) || [];
    for (const quote of quotes) {
      const cleaned = quote.replace(/"/g, '').trim();
      if (cleaned.length > 10 && cleaned.length < 50) {
        codes.push({
          name: cleaned.toLowerCase().replace(/\s+/g, '-'),
          definition: `In-vivo code: "${cleaned}"`,
          examples: [text],
          frequency: 1,
          type: 'in_vivo',
        });
      }
    }

    // Look for emotional or action-oriented phrases
    const emotionPatterns = /(feel|felt|feeling|think|thought|believe|believed)\s+(\w+)/gi;
    const matches = text.matchAll(emotionPatterns);
    for (const match of matches) {
      const phrase = match[0].toLowerCase();
      codes.push({
        name: phrase.replace(/\s+/g, '-'),
        definition: `Emotional/cognitive expression: ${phrase}`,
        examples: [text.substring(match.index || 0, (match.index || 0) + 100)],
        frequency: 1,
        type: 'in_vivo',
      });
    }

    return codes;
  }

  /**
   * Generate constructed codes based on content analysis
   */
  private generateConstructedCodes(text: string, methodology: string): Code[] {
    const codes: Code[] = [];
    const lowerText = text.toLowerCase();

    // Grounded Theory approach: focus on actions and processes
    if (methodology.includes('grounded') || methodology === 'general') {
      // Look for gerunds (action words ending in -ing)
      const gerunds = lowerText.match(/\b\w+ing\b/g) || [];
      const uniqueGerunds = [...new Set(gerunds)];

      for (const gerund of uniqueGerunds.slice(0, 5)) {
        if (gerund.length > 5) {
          codes.push({
            name: gerund,
            definition: `Process/action: ${gerund}`,
            examples: [text],
            frequency: 1,
            type: 'constructed',
          });
        }
      }

      // Identify relationship patterns
      if (/relationship|interaction|connection|between/i.test(text)) {
        codes.push({
          name: 'relational-dynamics',
          definition: 'Describes relationships or interactions between entities',
          examples: [text],
          frequency: 1,
          type: 'constructed',
        });
      }
    }

    // Thematic Analysis: look for patterns and themes
    if (methodology.includes('thematic') || methodology === 'general') {
      // Identify challenges/problems
      if (/difficult|challenge|problem|issue|struggle/i.test(text)) {
        codes.push({
          name: 'challenge-identified',
          definition: 'Participant describes a difficulty or challenge',
          examples: [text],
          frequency: 1,
          type: 'constructed',
        });
      }

      // Identify strategies/solutions
      if (/solution|strategy|approach|way to|how to/i.test(text)) {
        codes.push({
          name: 'coping-strategy',
          definition: 'Participant describes a strategy or solution',
          examples: [text],
          frequency: 1,
          type: 'constructed',
        });
      }

      // Identify emotions
      const emotions = ['happy', 'sad', 'angry', 'frustrated', 'excited', 'worried', 'anxious'];
      for (const emotion of emotions) {
        if (new RegExp(`\\b${emotion}\\b`, 'i').test(text)) {
          codes.push({
            name: `emotion-${emotion}`,
            definition: `Emotional state: ${emotion}`,
            examples: [text],
            frequency: 1,
            type: 'constructed',
          });
        }
      }
    }

    // Phenomenology: look for lived experiences
    if (methodology.includes('phenomenology')) {
      if (/experience|feel|sense|perceive/i.test(text)) {
        codes.push({
          name: 'lived-experience',
          definition: 'Description of lived experience or perception',
          examples: [text],
          frequency: 1,
          type: 'constructed',
        });
      }
    }

    return codes;
  }

  /**
   * Check if an existing code applies to text
   */
  private codeApplies(text: string, code: string): boolean {
    // Simple keyword matching (can be enhanced with embeddings)
    const keywords = code.split(/[-_\s]+/);
    const lowerText = text.toLowerCase();

    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    codes: Code[],
    segments: Array<{ codes: string[] }>
  ): CodingResult['summary'] {
    const totalCodes = codes.length;
    const inVivoCodes = codes.filter(c => c.type === 'in_vivo').length;
    const constructedCodes = codes.filter(c => c.type === 'constructed').length;
    const theoreticalCodes = codes.filter(c => c.type === 'theoretical').length;

    const totalCodeApplications = segments.reduce((sum, seg) => sum + seg.codes.length, 0);
    const averageCodesPerSegment = segments.length > 0 ? totalCodeApplications / segments.length : 0;

    return {
      totalCodes,
      inVivoCodes,
      constructedCodes,
      theoreticalCodes,
      averageCodesPerSegment: Math.round(averageCodesPerSegment * 10) / 10,
    };
  }

  /**
   * Refine codebook by merging similar codes
   */
  async refineCodebook(codes: Code[]): Promise<{
    refined: Code[];
    merges: Array<{ from: string[]; to: string; reason: string }>;
  }> {
    const merges: Array<{ from: string[]; to: string; reason: string }> = [];
    const refined: Code[] = [];

    // Group similar codes
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

    // Merge groups
    for (const [groupKey, groupCodes] of groups.entries()) {
      if (groupCodes.length > 1) {
        // Merge into single code
        const mergedCode: Code = {
          name: this.selectBestCodeName(groupCodes),
          definition: groupCodes[0].definition,
          examples: groupCodes.flatMap(c => c.examples).slice(0, 5),
          frequency: groupCodes.reduce((sum, c) => sum + c.frequency, 0),
          type: groupCodes[0].type,
        };

        refined.push(mergedCode);
        merges.push({
          from: groupCodes.map(c => c.name),
          to: mergedCode.name,
          reason: 'Similar semantic meaning',
        });
      } else {
        refined.push(groupCodes[0]);
      }
    }

    return { refined, merges };
  }

  /**
   * Check if two codes are similar
   */
  private codesAreSimilar(code1: Code, code2: Code): boolean {
    // Check if names share significant overlap
    const words1 = code1.name.split(/[-_\s]+/);
    const words2 = code2.name.split(/[-_\s]+/);

    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity > 0.5;
  }

  /**
   * Select best code name from group
   */
  private selectBestCodeName(codes: Code[]): string {
    // Prefer shorter, more general names
    return codes.sort((a, b) => a.name.length - b.name.length)[0].name;
  }
}
