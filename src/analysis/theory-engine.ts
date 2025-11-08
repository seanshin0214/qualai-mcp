/**
 * Theory Engine - Grounded Theory Development
 * Implements the systematic process of grounded theory construction
 */

import type { Code } from './coding-engine.js';
import type { Theme } from './theme-engine.js';

export interface Category {
  name: string;
  description: string;
  properties: string[];
  dimensions: Array<{
    property: string;
    range: string;
  }>;
  relatedCodes: string[];
  relatedCategories: string[];
  examples: string[];
}

export interface AxialCodingResult {
  phenomenon: string;
  causalConditions: string[];
  context: string[];
  interveningConditions: string[];
  actionStrategies: string[];
  consequences: string[];
}

export interface CoreCategory {
  name: string;
  description: string;
  centrality: number; // 0-1, how central this category is
  relationships: Array<{
    relatedCategory: string;
    relationshipType: 'causes' | 'leads_to' | 'influences' | 'part_of' | 'contradicts';
    description: string;
  }>;
  theoreticalMemo: string;
}

export interface GroundedTheoryResult {
  coreCategory: CoreCategory;
  supportingCategories: Category[];
  theoreticalFramework: string;
  storyline: string;
  stage: 'open_coding' | 'axial_coding' | 'selective_coding' | 'theory_integration';
  completeness: number; // 0-1
  recommendations: string[];
}

export class TheoryEngine {
  /**
   * Build grounded theory through systematic coding process
   */
  async buildGroundedTheory(params: {
    codes: Code[];
    themes?: Theme[];
    researchQuestion: string;
    paradigm?: 'constructivist' | 'objectivist';
  }): Promise<GroundedTheoryResult> {
    const { codes, themes, researchQuestion, paradigm = 'constructivist' } = params;

    // Stage 1: Open Coding (already done via codes)
    // Extract categories from codes
    const categories = await this.identifyCategories(codes, paradigm);

    // Stage 2: Axial Coding - Find relationships
    const axialResults = await this.performAxialCoding(categories, codes);

    // Stage 3: Selective Coding - Identify core category
    const coreCategory = await this.identifyCoreCategory(
      categories,
      axialResults,
      researchQuestion
    );

    // Stage 4: Theory Integration - Build coherent theory
    const theory = await this.integrateTheory(
      coreCategory,
      categories,
      axialResults,
      researchQuestion,
      paradigm
    );

    return theory;
  }

  /**
   * Stage 1: Identify categories from open codes
   */
  private async identifyCategories(
    codes: Code[],
    paradigm: 'constructivist' | 'objectivist'
  ): Promise<Category[]> {
    const categories: Category[] = [];

    // Group codes into conceptual categories
    const groups = this.groupCodesIntoCategories(codes);

    for (const [categoryName, categoryCodes] of groups.entries()) {
      // Allow single-code categories for small datasets (testing/early analysis)
      if (categoryCodes.length < 1) continue;

      const category: Category = {
        name: categoryName,
        description: this.generateCategoryDescription(categoryCodes, paradigm),
        properties: this.identifyProperties(categoryCodes),
        dimensions: this.identifyDimensions(categoryCodes),
        relatedCodes: categoryCodes.map(c => c.name),
        relatedCategories: [],
        examples: categoryCodes.flatMap(c => c.examples).slice(0, 3),
      };

      categories.push(category);
    }

    return categories;
  }

  /**
   * Group codes into conceptual categories
   */
  private groupCodesIntoCategories(codes: Code[]): Map<string, Code[]> {
    const groups = new Map<string, Code[]>();

    // Identify categories based on conceptual similarity
    for (const code of codes) {
      const categoryName = this.inferCategoryName(code);

      if (!groups.has(categoryName)) {
        groups.set(categoryName, []);
      }

      groups.get(categoryName)!.push(code);
    }

    // Merge similar categories
    return this.mergeSimilarCategories(groups);
  }

  /**
   * Infer category name from code
   */
  private inferCategoryName(code: Code): string {
    const name = code.name.toLowerCase();
    const definition = code.definition.toLowerCase();

    // Process/Action categories (gerunds)
    if (name.endsWith('ing') || /process|action|doing/.test(definition)) {
      return 'processes';
    }

    // Condition categories
    if (/condition|situation|context|when/.test(definition) || /condition/.test(name)) {
      return 'conditions';
    }

    // Strategy categories
    if (/strategy|approach|cope|manage|handle/.test(definition) || /strategy|coping/.test(name)) {
      return 'strategies';
    }

    // Emotion categories
    if (/emotion|feel|emotion/.test(definition) || /emotion|feel/.test(name)) {
      return 'emotions';
    }

    // Challenge categories
    if (/challenge|problem|difficulty|barrier/.test(definition) || /challenge|problem/.test(name)) {
      return 'challenges';
    }

    // Outcome categories
    if (/outcome|result|consequence|effect/.test(definition) || /outcome|result/.test(name)) {
      return 'outcomes';
    }

    // Relationship categories
    if (/relationship|interaction|connection/.test(definition) || /relational/.test(name)) {
      return 'relationships';
    }

    // Default: use first significant word
    const words = name.split(/[-_\s]+/).filter(w => w.length > 3);
    return words[0] || 'miscellaneous';
  }

  /**
   * Merge categories that are semantically similar
   */
  private mergeSimilarCategories(groups: Map<string, Code[]>): Map<string, Code[]> {
    const merged = new Map<string, Code[]>();
    const categoryNames = Array.from(groups.keys());

    for (const category of categoryNames) {
      let foundMerge = false;

      for (const [mergedKey, mergedCodes] of merged.entries()) {
        if (this.categoriesAreSimilar(category, mergedKey)) {
          mergedCodes.push(...(groups.get(category) || []));
          foundMerge = true;
          break;
        }
      }

      if (!foundMerge) {
        merged.set(category, groups.get(category) || []);
      }
    }

    return merged;
  }

  /**
   * Check if two category names are similar
   */
  private categoriesAreSimilar(cat1: string, cat2: string): boolean {
    // Exact match
    if (cat1 === cat2) return true;

    // Plural/singular match
    if (cat1 === cat2 + 's' || cat2 === cat1 + 's') return true;
    if (cat1 === cat2 + 'es' || cat2 === cat1 + 'es') return true;

    // Common word overlap
    const words1 = cat1.split(/[-_\s]+/);
    const words2 = cat2.split(/[-_\s]+/);
    const common = words1.filter(w => words2.includes(w));

    return common.length > 0;
  }

  /**
   * Generate category description
   */
  private generateCategoryDescription(
    codes: Code[],
    paradigm: 'constructivist' | 'objectivist'
  ): string {
    const prefix = paradigm === 'constructivist'
      ? 'This category represents participants\' experiences of'
      : 'This category describes the phenomenon of';

    const codeList = codes.map(c => c.name).join(', ');
    return `${prefix} ${codeList}. It emerged from ${codes.length} codes across the data.`;
  }

  /**
   * Identify properties of a category
   */
  private identifyProperties(codes: Code[]): string[] {
    const properties = new Set<string>();

    for (const code of codes) {
      // Extract key characteristics
      const words = code.name.split(/[-_\s]+/);

      // Properties are typically adjectives or descriptive terms
      for (const word of words) {
        if (word.length > 3 && !this.isCommonWord(word)) {
          properties.add(word);
        }
      }
    }

    return Array.from(properties).slice(0, 5);
  }

  /**
   * Identify dimensions (ranges of properties)
   */
  private identifyDimensions(codes: Code[]): Array<{ property: string; range: string }> {
    const dimensions: Array<{ property: string; range: string }> = [];
    const properties = this.identifyProperties(codes);

    for (const property of properties) {
      // Infer dimensional range
      dimensions.push({
        property,
        range: this.inferDimensionalRange(property, codes),
      });
    }

    return dimensions;
  }

  /**
   * Infer dimensional range for a property
   */
  private inferDimensionalRange(property: string, codes: Code[]): string {
    // Look for intensity indicators
    const hasIntensity = codes.some(c =>
      /low|high|strong|weak|intense|mild/.test(c.definition.toLowerCase())
    );

    if (hasIntensity) {
      return 'low to high';
    }

    // Look for frequency indicators
    const hasFrequency = codes.some(c =>
      /often|sometimes|rarely|always|never/.test(c.definition.toLowerCase())
    );

    if (hasFrequency) {
      return 'rarely to frequently';
    }

    // Default temporal or qualitative range
    return 'varies across contexts';
  }

  /**
   * Stage 2: Perform axial coding to find relationships
   */
  private async performAxialCoding(
    categories: Category[],
    codes: Code[]
  ): Promise<AxialCodingResult[]> {
    const results: AxialCodingResult[] = [];

    for (const category of categories) {
      const axialResult = await this.analyzeParadigmModel(category, categories, codes);
      if (axialResult) {
        results.push(axialResult);
      }
    }

    return results;
  }

  /**
   * Analyze using Strauss & Corbin's paradigm model
   */
  private async analyzeParadigmModel(
    category: Category,
    allCategories: Category[],
    codes: Code[]
  ): Promise<AxialCodingResult | null> {
    // Identify components of the paradigm model
    const phenomenon = category.name;

    // Causal conditions: What leads to this phenomenon?
    const causalConditions = this.identifyCausalConditions(category, allCategories, codes);

    // Context: In what situations does this occur?
    const context = this.identifyContext(category, allCategories, codes);

    // Intervening conditions: What factors influence it?
    const interveningConditions = this.identifyInterveningConditions(category, allCategories);

    // Action/interaction strategies: How do people respond?
    const actionStrategies = this.identifyActionStrategies(category, allCategories);

    // Consequences: What results from this?
    const consequences = this.identifyConsequences(category, allCategories, codes);

    return {
      phenomenon,
      causalConditions,
      context,
      interveningConditions,
      actionStrategies,
      consequences,
    };
  }

  /**
   * Identify causal conditions
   */
  private identifyCausalConditions(
    category: Category,
    allCategories: Category[],
    codes: Code[]
  ): string[] {
    const conditions: string[] = [];

    // Look for categories that might cause this phenomenon
    for (const other of allCategories) {
      if (other.name === category.name) continue;

      // Check if other category appears before this one in narratives
      if (other.name.includes('condition') || other.name.includes('cause')) {
        conditions.push(other.name);
      }
    }

    // Look for codes that describe causes
    const causalCodes = codes.filter(c =>
      /because|due to|caused by|result of|led to/.test(c.definition.toLowerCase())
    );

    conditions.push(...causalCodes.map(c => c.name).slice(0, 3));

    return conditions;
  }

  /**
   * Identify contextual factors
   */
  private identifyContext(
    category: Category,
    allCategories: Category[],
    codes: Code[]
  ): string[] {
    const context: string[] = [];

    // Look for situational or environmental factors
    for (const other of allCategories) {
      if (other.name.includes('context') || other.name.includes('situation')) {
        context.push(other.name);
      }
    }

    // Look for codes describing situations
    const contextCodes = codes.filter(c =>
      /when|where|situation|context|environment/.test(c.definition.toLowerCase())
    );

    context.push(...contextCodes.map(c => c.name).slice(0, 3));

    return context;
  }

  /**
   * Identify intervening conditions
   */
  private identifyInterveningConditions(
    category: Category,
    allCategories: Category[]
  ): string[] {
    const conditions: string[] = [];

    // Look for factors that influence or moderate
    for (const other of allCategories) {
      if (other.name === category.name) continue;

      if (
        other.name.includes('factor') ||
        other.name.includes('influence') ||
        other.name.includes('barrier')
      ) {
        conditions.push(other.name);
      }
    }

    return conditions;
  }

  /**
   * Identify action/interaction strategies
   */
  private identifyActionStrategies(
    category: Category,
    allCategories: Category[]
  ): string[] {
    const strategies: string[] = [];

    // Look for strategy or action categories
    for (const other of allCategories) {
      if (
        other.name.includes('strategy') ||
        other.name.includes('coping') ||
        other.name.includes('approach') ||
        other.name.includes('process')
      ) {
        strategies.push(other.name);
      }
    }

    return strategies;
  }

  /**
   * Identify consequences
   */
  private identifyConsequences(
    category: Category,
    allCategories: Category[],
    codes: Code[]
  ): string[] {
    const consequences: string[] = [];

    // Look for outcome categories
    for (const other of allCategories) {
      if (
        other.name.includes('outcome') ||
        other.name.includes('result') ||
        other.name.includes('consequence') ||
        other.name.includes('effect')
      ) {
        consequences.push(other.name);
      }
    }

    // Look for codes describing outcomes
    const outcomeCodes = codes.filter(c =>
      /result|outcome|led to|caused|effect/.test(c.definition.toLowerCase())
    );

    consequences.push(...outcomeCodes.map(c => c.name).slice(0, 3));

    return consequences;
  }

  /**
   * Stage 3: Identify core category through selective coding
   */
  private async identifyCoreCategory(
    categories: Category[],
    axialResults: AxialCodingResult[],
    researchQuestion: string
  ): Promise<CoreCategory> {
    // Calculate centrality for each category
    const categoryScores = new Map<string, number>();

    for (const category of categories) {
      let score = 0;

      // Score based on frequency
      score += category.relatedCodes.length;

      // Score based on connections to other categories
      const connections = axialResults.find(ar => ar.phenomenon === category.name);
      if (connections) {
        score += connections.causalConditions.length * 2;
        score += connections.consequences.length * 2;
        score += connections.actionStrategies.length * 1.5;
        score += connections.context.length;
        score += connections.interveningConditions.length;
      }

      categoryScores.set(category.name, score);
    }

    // Find category with highest centrality
    const sorted = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1]);

    // Handle case when no categories exist
    if (sorted.length === 0 || !sorted[0]) {
      throw new Error('No categories found. Please ensure your codes can form at least one category.');
    }

    const [coreName, coreScore] = sorted[0];
    const coreCategory = categories.find(c => c.name === coreName);

    if (!coreCategory) {
      throw new Error(`Core category "${coreName}" not found in categories list.`);
    }

    const coreAxial = axialResults.find(ar => ar.phenomenon === coreName);

    // Build relationships
    const relationships: CoreCategory['relationships'] = [];

    if (coreAxial) {
      for (const cause of coreAxial.causalConditions) {
        relationships.push({
          relatedCategory: cause,
          relationshipType: 'causes',
          description: `${cause} contributes to the emergence of ${coreName}`,
        });
      }

      for (const consequence of coreAxial.consequences) {
        relationships.push({
          relatedCategory: consequence,
          relationshipType: 'leads_to',
          description: `${coreName} results in ${consequence}`,
        });
      }

      for (const strategy of coreAxial.actionStrategies) {
        relationships.push({
          relatedCategory: strategy,
          relationshipType: 'influences',
          description: `${coreName} is managed through ${strategy}`,
        });
      }
    }

    // Generate theoretical memo
    const theoreticalMemo = this.generateTheoreticalMemo(
      coreCategory,
      coreAxial,
      researchQuestion
    );

    const totalScore = Array.from(categoryScores.values()).reduce((a, b) => a + b, 0);
    const centrality = totalScore > 0 ? coreScore / totalScore : 0;

    return {
      name: coreName,
      description: coreCategory.description,
      centrality,
      relationships,
      theoreticalMemo,
    };
  }

  /**
   * Generate theoretical memo for core category
   */
  private generateTheoreticalMemo(
    category: Category,
    axialResult: AxialCodingResult | undefined,
    researchQuestion: string
  ): string {
    let memo = `THEORETICAL MEMO: ${category.name.toUpperCase()}\n\n`;
    memo += `Research Question: ${researchQuestion}\n\n`;
    memo += `The core category "${category.name}" emerged as the central phenomenon `;
    memo += `organizing this grounded theory. `;

    if (axialResult) {
      if (axialResult.causalConditions.length > 0) {
        memo += `It appears to be caused or influenced by: ${axialResult.causalConditions.join(', ')}. `;
      }

      if (axialResult.context.length > 0) {
        memo += `This occurs within the context of: ${axialResult.context.join(', ')}. `;
      }

      if (axialResult.actionStrategies.length > 0) {
        memo += `Participants respond through strategies such as: ${axialResult.actionStrategies.join(', ')}. `;
      }

      if (axialResult.consequences.length > 0) {
        memo += `The consequences include: ${axialResult.consequences.join(', ')}. `;
      }
    }

    memo += `\n\nThis category integrates ${category.relatedCodes.length} codes `;
    memo += `and provides a theoretical explanation for the phenomenon under study.`;

    return memo;
  }

  /**
   * Stage 4: Integrate theory
   */
  private async integrateTheory(
    coreCategory: CoreCategory,
    categories: Category[],
    axialResults: AxialCodingResult[],
    researchQuestion: string,
    paradigm: 'constructivist' | 'objectivist'
  ): Promise<GroundedTheoryResult> {
    // Generate theoretical framework
    const theoreticalFramework = this.generateTheoreticalFramework(
      coreCategory,
      categories,
      axialResults,
      paradigm
    );

    // Generate storyline
    const storyline = this.generateStoryline(
      coreCategory,
      categories,
      axialResults,
      researchQuestion
    );

    // Calculate completeness
    const completeness = this.assessTheoryCompleteness(
      coreCategory,
      categories,
      axialResults
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      completeness,
      coreCategory,
      categories
    );

    return {
      coreCategory,
      supportingCategories: categories,
      theoreticalFramework,
      storyline,
      stage: 'theory_integration',
      completeness,
      recommendations,
    };
  }

  /**
   * Generate theoretical framework description
   */
  private generateTheoreticalFramework(
    coreCategory: CoreCategory,
    categories: Category[],
    axialResults: AxialCodingResult[],
    paradigm: 'constructivist' | 'objectivist'
  ): string {
    const approach = paradigm === 'constructivist'
      ? 'This grounded theory, constructed from participants\' lived experiences, '
      : 'This grounded theory, derived from systematic data analysis, ';

    let framework = approach;
    framework += `proposes that "${coreCategory.name}" serves as the core organizing concept. `;

    framework += `\n\nThe theory identifies ${categories.length} major categories that interact `;
    framework += `to explain the phenomenon. These categories are: `;
    framework += categories.map(c => c.name).join(', ') + '. ';

    framework += `\n\nThe relationships between categories follow this pattern:\n`;

    for (const rel of coreCategory.relationships) {
      framework += `- ${rel.description}\n`;
    }

    framework += `\nThis theoretical framework provides a substantive explanation of the processes `;
    framework += `and patterns observed in the data.`;

    return framework;
  }

  /**
   * Generate storyline integrating all elements
   */
  private generateStoryline(
    coreCategory: CoreCategory,
    categories: Category[],
    axialResults: AxialCodingResult[],
    researchQuestion: string
  ): string {
    let storyline = `GROUNDED THEORY STORYLINE\n\n`;
    storyline += `Addressing the research question "${researchQuestion}", `;
    storyline += `this theory explains how ${coreCategory.name} operates as the central process.\n\n`;

    const coreAxial = axialResults.find(ar => ar.phenomenon === coreCategory.name);

    if (coreAxial) {
      // Beginning: Conditions
      if (coreAxial.causalConditions.length > 0 || coreAxial.context.length > 0) {
        storyline += `The process begins when certain conditions are present. `;
        if (coreAxial.causalConditions.length > 0) {
          storyline += `Causal factors include ${coreAxial.causalConditions.join(', ')}. `;
        }
        if (coreAxial.context.length > 0) {
          storyline += `This occurs within contexts characterized by ${coreAxial.context.join(', ')}. `;
        }
        storyline += `\n\n`;
      }

      // Middle: Actions
      if (coreAxial.actionStrategies.length > 0) {
        storyline += `In response to these conditions, participants engage in various strategies. `;
        storyline += `Key approaches include ${coreAxial.actionStrategies.join(', ')}. `;
        if (coreAxial.interveningConditions.length > 0) {
          storyline += `These strategies are shaped by intervening factors such as `;
          storyline += `${coreAxial.interveningConditions.join(', ')}. `;
        }
        storyline += `\n\n`;
      }

      // End: Consequences
      if (coreAxial.consequences.length > 0) {
        storyline += `The outcomes of this process include ${coreAxial.consequences.join(', ')}. `;
        storyline += `These consequences may, in turn, influence future iterations of the process, `;
        storyline += `creating a dynamic and evolving pattern.\n\n`;
      }
    }

    storyline += `This integrated storyline demonstrates how the categories work together `;
    storyline += `to form a coherent theoretical explanation.`;

    return storyline;
  }

  /**
   * Assess theory completeness
   */
  private assessTheoryCompleteness(
    coreCategory: CoreCategory,
    categories: Category[],
    axialResults: AxialCodingResult[]
  ): number {
    let score = 0;
    let maxScore = 0;

    // Has core category (essential)
    maxScore += 20;
    if (coreCategory) score += 20;

    // Has supporting categories
    maxScore += 20;
    score += Math.min(categories.length * 4, 20);

    // Has relationships
    maxScore += 20;
    score += Math.min(coreCategory.relationships.length * 5, 20);

    // Has axial coding
    maxScore += 20;
    score += Math.min(axialResults.length * 4, 20);

    // Core category has high centrality
    maxScore += 20;
    score += coreCategory.centrality * 20;

    return Math.min(score / maxScore, 1);
  }

  /**
   * Generate recommendations for theory development
   */
  private generateRecommendations(
    completeness: number,
    coreCategory: CoreCategory,
    categories: Category[]
  ): string[] {
    const recommendations: string[] = [];

    if (completeness < 0.6) {
      recommendations.push(
        'Theory is incomplete. Continue data collection and coding to develop more robust categories.'
      );
    } else if (completeness < 0.8) {
      recommendations.push(
        'Theory is developing well. Focus on refining relationships between categories.'
      );
    } else {
      recommendations.push(
        'Theory is well-developed and ready for validation and refinement.'
      );
    }

    if (coreCategory.relationships.length < 3) {
      recommendations.push(
        'Consider exploring more relationships between the core category and other categories.'
      );
    }

    if (categories.length < 5) {
      recommendations.push(
        'Theory might benefit from identifying additional categories through further analysis.'
      );
    }

    if (coreCategory.centrality < 0.5) {
      recommendations.push(
        'The identified core category may not be sufficiently central. Consider if another category better integrates the theory.'
      );
    }

    recommendations.push(
      'Write detailed theoretical memos to document your analytical decisions.'
    );

    recommendations.push(
      'Consider member checking by sharing preliminary findings with participants.'
    );

    return recommendations;
  }

  /**
   * Helper: Check if word is common and should be filtered
   */
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'for', 'with', 'from', 'that', 'this',
      'have', 'has', 'had', 'was', 'were', 'been', 'being',
    ];
    return commonWords.includes(word.toLowerCase());
  }
}
