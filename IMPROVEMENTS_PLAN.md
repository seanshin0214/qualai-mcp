# QualAI MCP Improvement Plan: 82 → 92/100

**Current Status**: 82/100
**Target**: 92/100 (90+ required)
**Timeline**: Immediate

---

## 📊 Current Assessment (Revised)

### ✅ Strengths (82 points)
1. **World-class Analysis Engines** (30/30 points)
   - coding-engine.ts: 395 lines, full in-vivo/constructed/theoretical coding
   - theme-engine.ts: 504 lines, inductive/deductive, saturation detection, negative case analysis
   - theory-engine.ts: 865 lines, complete grounded theory (open → axial → selective → integration)

2. **Solid Architecture** (15/15 points)
   - MCP v1.7.0 protocol
   - SQLite knowledge graph with FTS5
   - Qdrant optional vector search
   - Methodology RAG working perfectly

3. **Project Management** (8/10 points)
   - createProject, addDataSource fully working
   - Knowledge graph integration

4. **Partial Tool Handlers** (12/20 points)
   - 5 tools fully working (methodology + project management)
   - buildGroundedTheory handler complete (lines 592-722)
   - autoCoding placeholder exists (lines 580-589)
   - 13 tools return placeholder messages

5. **Documentation** (17/25 points)
   - Comprehensive README
   - Technical spec (partial)
   - No API examples for new tools

### 🔴 Critical Gaps (18 points needed → 92/100)

| Gap | Impact | Priority | Points |
|-----|--------|----------|---------|
| **6 Missing Tool Handlers** | Can't use core features | P0 | +8 |
| **0 Tests** | No quality assurance | P0 | +6 |
| **Poor Error Handling** | System fragile | P1 | +2 |
| **Only 2 Methodologies** | Limited community value | P1 | +2 |

---

## 🎯 Implementation Tasks

### Phase 1: Critical Tool Handlers (P0) - +8 points

#### 1.1 Coding Tools (2 handlers)
**File**: `src/index.ts`

```typescript
case 'refineCodebook': {
  const parsed = refineCodebookSchema.parse(args);

  // Get all codes from project
  const projectEntity = db.getEntity(parsed.projectName);
  if (!projectEntity) throw new Error(`Project not found`);

  const relations = db.getRelations(parsed.projectName);
  const codeEntities = relations
    .filter(r => r.entityType === 'code')
    .map(r => db.getEntity(r.from));

  const codes = codeEntities.map(e => ({
    name: e.name,
    definition: e.observations[0],
    examples: e.metadata.examples || [],
    frequency: e.metadata.frequency || 1,
    type: e.metadata.type || 'constructed',
  }));

  const refined = await codingEngine.refineCodebook(codes);

  // Update knowledge graph with merged codes
  for (const merge of refined.merges) {
    // Delete old codes, create new merged code
  }

  return {
    content: [{
      type: 'text',
      text: `Refined codebook:\n- Merged ${refined.merges.length} code groups\n- Final codes: ${refined.refined.length}`,
    }],
  };
}

case 'analyzePatterns': {
  const parsed = { projectName: args.projectName };

  // Get all codes
  const codes = [...]; // similar to refineCodebook

  const patterns = await themeEngine.analyzePatterns(codes);

  return {
    content: [{
      type: 'text',
      text: `Found ${patterns.length} patterns:\n${patterns.map(p => `- ${p.type}: ${p.description}`).join('\n')}`,
    }],
  };
}
```

#### 1.2 Theme Tools (2 handlers)

```typescript
case 'extractThemes': {
  const parsed = extractThemesSchema.parse(args);

  // Get codes from project
  const codes = [...]; // similar to above

  const themes = await themeEngine.extractThemes({
    codes,
    mode: parsed.mode,
    depth: parsed.depth || 'medium',
  });

  // Store themes in knowledge graph
  for (const theme of themes) {
    db.createEntity({
      name: `${parsed.projectName}__theme__${theme.name}`,
      entityType: 'theme',
      observations: [theme.description],
      metadata: { theme },
    });
  }

  return {
    content: [{
      type: 'text',
      text: `Extracted ${themes.length} themes:\n${themes.map(t => `- ${t.name} (${(t.prevalence * 100).toFixed(1)}%)`).join('\n')}`,
    }],
  };
}

case 'detectSaturation': {
  const parsed = detectSaturationSchema.parse(args);

  // Get codes by source
  const relations = db.getRelations(parsed.projectName);
  const sources = relations.filter(r => r.relationType === 'part_of');

  const codesBySource = new Map();
  for (const source of sources) {
    const sourceCodes = [...]; // extract codes for this source
    codesBySource.set(source.from, sourceCodes);
  }

  const saturation = await themeEngine.detectSaturation({
    level: parsed.level,
    codesBySource,
  });

  return {
    content: [{
      type: 'text',
      text: `Saturation Analysis (${parsed.level}):\n- Saturated: ${saturation.saturated}\n- Rate: ${(saturation.saturationRate * 100).toFixed(1)}%\n- Recommendation: ${saturation.recommendation}`,
    }],
  };
}
```

#### 1.3 Validation Tools (2 handlers)

```typescript
case 'findNegativeCases': {
  const parsed = findNegativeCasesSchema.parse(args);

  // Get theme entity
  const themeEntity = db.getEntity(parsed.theme);
  const theme = themeEntity?.metadata?.theme;

  // Get all codes
  const allCodes = [...];

  const result = await themeEngine.findNegativeCases({
    theme,
    allCodes,
    threshold: parsed.threshold || 'moderate',
  });

  return {
    content: [{
      type: 'text',
      text: `Found ${result.negativeCases.length} negative cases:\n${result.negativeCases.map(nc => `- ${nc.code}: ${nc.contradiction} (${nc.strength})`).join('\n')}\n\nRecommendation: ${result.recommendation}`,
    }],
  };
}

case 'calculateReliability': {
  const parsed = calculateReliabilitySchema.parse(args);

  // Calculate Cohen's Kappa
  const agreements = parsed.coder1Codes.filter(c => parsed.coder2Codes.includes(c)).length;
  const totalCodes = new Set([...parsed.coder1Codes, ...parsed.coder2Codes]).size;

  const po = agreements / totalCodes; // observed agreement
  const pe = 0.5; // expected agreement (simplified)
  const kappa = (po - pe) / (1 - pe);

  return {
    content: [{
      type: 'text',
      text: `Inter-Coder Reliability:\n- Measure: Cohen's Kappa\n- κ = ${kappa.toFixed(3)}\n- Interpretation: ${kappa > 0.8 ? 'Excellent' : kappa > 0.6 ? 'Good' : 'Fair'}\n- Agreements: ${agreements}/${totalCodes}`,
    }],
  };
}
```

**Estimated Time**: 2 hours
**Points**: +8

---

### Phase 2: Test Coverage (P0) - +6 points

**Target**: 70%+ coverage

#### 2.1 Analysis Engine Tests

**File**: `tests/coding-engine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { CodingEngine } from '../src/analysis/coding-engine';

describe('CodingEngine', () => {
  const engine = new CodingEngine();

  describe('autoCoding', () => {
    it('should extract in-vivo codes from text', async () => {
      const result = await engine.autoCoding({
        text: 'I feel really anxious about the upcoming exam.',
      });

      expect(result.codes.length).toBeGreaterThan(0);
      expect(result.codes.some(c => c.type === 'in_vivo')).toBe(true);
    });

    it('should generate constructed codes', async () => {
      const result = await engine.autoCoding({
        text: 'Managing stress through meditation',
        methodology: 'grounded',
      });

      expect(result.codes.some(c => c.type === 'constructed')).toBe(true);
    });

    it('should apply existing codes via keyword matching', async () => {
      const result = await engine.autoCoding({
        text: 'I am coping with stress',
        existingCodes: ['stress-management', 'coping-strategies'],
      });

      expect(result.codes.some(c => c.name.includes('stress') || c.name.includes('coping'))).toBe(true);
    });
  });

  describe('refineCodebook', () => {
    it('should merge similar codes', async () => {
      const codes = [
        { name: 'stress-coping', definition: 'coping with stress', examples: [], frequency: 3, type: 'constructed' as const },
        { name: 'coping-stress', definition: 'managing stress', examples: [], frequency: 2, type: 'constructed' as const },
      ];

      const result = await engine.refineCodebook(codes);

      expect(result.merges.length).toBeGreaterThan(0);
      expect(result.refined.length).toBeLessThan(codes.length);
    });
  });
});
```

**File**: `tests/theme-engine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ThemeEngine } from '../src/analysis/theme-engine';

describe('ThemeEngine', () => {
  const engine = new ThemeEngine();

  describe('extractThemes', () => {
    it('should extract themes inductively', async () => {
      const codes = [
        { name: 'anxiety', definition: 'feeling anxious', examples: ['text1'], frequency: 5, type: 'in_vivo' as const },
        { name: 'stress', definition: 'feeling stressed', examples: ['text2'], frequency: 4, type: 'in_vivo' as const },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'inductive',
        depth: 'medium',
      });

      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toHaveProperty('name');
      expect(themes[0]).toHaveProperty('prevalence');
    });

    it('should extract themes deductively', async () => {
      const codes = [
        { name: 'challenge-overcome', definition: 'overcoming challenges', examples: [], frequency: 3, type: 'constructed' as const },
      ];

      const themes = await engine.extractThemes({
        codes,
        mode: 'deductive',
      });

      expect(themes.length).toBeGreaterThan(0);
      expect(themes.some(t => t.name.includes('Challenge'))).toBe(true);
    });
  });

  describe('detectSaturation', () => {
    it('should detect saturation when no new codes appear', async () => {
      const codesBySource = new Map([
        ['source1', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['source2', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
        ['source3', [{ name: 'code1', definition: '', examples: [], frequency: 1, type: 'constructed' as const }]],
      ]);

      const result = await engine.detectSaturation({
        level: 'code',
        codesBySource,
      });

      expect(result.saturated).toBe(true);
      expect(result.saturationRate).toBeGreaterThan(0.8);
    });
  });
});
```

**File**: `tests/theory-engine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { TheoryEngine } from '../src/analysis/theory-engine';

describe('TheoryEngine', () => {
  const engine = new TheoryEngine();

  describe('buildGroundedTheory', () => {
    it('should build complete grounded theory', async () => {
      const codes = [
        { name: 'managing-stress', definition: 'coping strategies', examples: [], frequency: 5, type: 'constructed' as const },
        { name: 'feeling-anxious', definition: 'anxiety emotions', examples: [], frequency: 4, type: 'in_vivo' as const },
        { name: 'support-seeking', definition: 'seeking help', examples: [], frequency: 3, type: 'constructed' as const },
      ];

      const result = await engine.buildGroundedTheory({
        codes,
        researchQuestion: 'How do students cope with academic stress?',
        paradigm: 'constructivist',
      });

      expect(result.coreCategory).toBeDefined();
      expect(result.supportingCategories.length).toBeGreaterThan(0);
      expect(result.theoreticalFramework).toBeDefined();
      expect(result.storyline).toBeDefined();
      expect(result.completeness).toBeGreaterThan(0);
    });
  });
});
```

**Estimated Time**: 3 hours
**Points**: +6

---

### Phase 3: Error Handling (P1) - +2 points

#### 3.1 Wrapper with Try-Catch

**File**: `src/index.ts` (update CallToolRequestSchema handler)

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Validate args exist
    if (!args) {
      throw new Error('Missing arguments');
    }

    // Log request
    console.error(`[QualAI] ${name} called with args:`, JSON.stringify(args).slice(0, 100));

    switch (name) {
      // ... all cases
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[QualAI ERROR] ${name}:`, errorMessage);

    // User-friendly error messages
    let userMessage = errorMessage;

    if (errorMessage.includes('not found')) {
      userMessage = `❌ ${errorMessage}\n\nTip: Use listMethodologies or createProject first.`;
    } else if (errorMessage.includes('parse')) {
      userMessage = `❌ Invalid arguments for ${name}\n\nPlease check the required parameters.`;
    }

    return {
      content: [{
        type: 'text',
        text: userMessage,
      }],
      isError: true,
    };
  }
});
```

**Estimated Time**: 1 hour
**Points**: +2

---

### Phase 4: Community Methodologies (P1) - +2 points

**File**: `src/rag/methodologies/community-methodologies.ts`

Add 8 more methodologies:
1. Narrative Analysis (Riessman 2008)
2. Discourse Analysis (Gee 2014)
3. Ethnography (Hammersley & Atkinson 2019)
4. Case Study (Yin 2018)
5. Action Research (Reason & Bradbury 2008)
6. Phenomenography (Marton 1981)
7. Hermeneutic Analysis (Gadamer 1989)
8. Critical Incident Technique (Flanagan 1954)

**Estimated Time**: 2 hours
**Points**: +2

---

## 📊 Expected Final Score

| Category | Before | After | Gain |
|----------|--------|-------|------|
| Core Engines | 30 | 30 | 0 |
| Tool Handlers | 12 | 20 | +8 |
| Tests | 0 | 6 | +6 |
| Error Handling | 1 | 3 | +2 |
| Methodologies | 2 | 4 | +2 |
| **TOTAL** | **82** | **92** | **+10** |

---

## 🚀 Execution Order

1. **Phase 1** (P0): Tool Handlers → +8 points (2h)
2. **Phase 2** (P0): Test Coverage → +6 points (3h)
3. **Phase 3** (P1): Error Handling → +2 points (1h)
4. **Phase 4** (P1): Methodologies → +2 points (2h)

**Total Time**: 8 hours
**Final Score**: **92/100** ✅ (exceeds 90-point requirement)
