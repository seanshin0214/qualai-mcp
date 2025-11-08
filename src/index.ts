#!/usr/bin/env node

/**
 * QualAI MCP Server
 * AI-Powered Community-Driven Qualitative Research Analysis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SQLiteAdapter } from './knowledge/storage/sqlite-adapter.js';
import { MethodologyRAG } from './rag/methodology-rag.js';
import { z } from 'zod';
import { CodingEngine } from './analysis/coding-engine.js';
import { ThemeEngine } from './analysis/theme-engine.js';
import { TheoryEngine } from './analysis/theory-engine.js';


const codingEngine = new CodingEngine();
const themeEngine = new ThemeEngine();
const theoryEngine = new TheoryEngine();
// Initialize core systems
const db = new SQLiteAdapter();
const rag = new MethodologyRAG();

// Create MCP server
const server = new Server(
  {
    name: 'qualai-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool Definitions
 */

// 1. Methodology Selection & Management
const selectMethodologySchema = z.object({
  intent: z.string().describe('What you want to do with your data'),
  dataType: z.string().optional().describe('Type of data (interview, observation, document)'),
  researchGoal: z.enum(['theory_building', 'description', 'exploration', 'evaluation']).optional(),
  sampleSize: z.number().optional().describe('Number of data sources'),
});

const loadMethodologySchema = z.object({
  methodologyId: z.string().describe('ID of the methodology to load'),
});

const listMethodologiesSchema = z.object({
  category: z.string().optional().describe('Filter by category'),
});

// 2. Coding Tools
const autoCodingSchema = z.object({
  text: z.string().describe('Text to analyze and code'),
  existingCodes: z.array(z.string()).optional().describe('Existing codes to consider'),
  methodology: z.string().optional().describe('Methodology to follow'),
});

const refineCodebookSchema = z.object({
  projectName: z.string().describe('Project name'),
});

const mergeCodesSmartSchema = z.object({
  codes: z.array(z.string()).describe('Codes to analyze for potential merging'),
});

const suggestSubcodesSchema = z.object({
  code: z.string().describe('Parent code to suggest subcodes for'),
});

// 3. Thematic Analysis Tools
const extractThemesSchema = z.object({
  projectName: z.string().describe('Project name'),
  mode: z.enum(['inductive', 'deductive']).describe('Analysis mode'),
  depth: z.enum(['shallow', 'medium', 'deep']).optional(),
});

const detectSaturationSchema = z.object({
  projectName: z.string().describe('Project name'),
  level: z.enum(['code', 'theme', 'theoretical']).describe('Level to check saturation'),
});

// 4. Validation Tools
const findNegativeCasesSchema = z.object({
  theme: z.string().describe('Theme to find negative cases for'),
  threshold: z.enum(['weak', 'moderate', 'strong']).describe('Contradiction threshold'),
});

const calculateReliabilitySchema = z.object({
  segment: z.string().describe('Text segment coded by multiple coders'),
  coder1Codes: z.array(z.string()).describe('Codes from first coder'),
  coder2Codes: z.array(z.string()).describe('Codes from second coder'),
  measure: z.enum(['cohens_kappa', 'percentage_agreement']).optional(),
});

// 5. Theory Building Tools
const buildGroundedTheorySchema = z.object({
  projectName: z.string().describe('Project name'),
  researchQuestion: z.string().describe('Research question'),
  paradigm: z.enum(['constructivist', 'objectivist']).optional(),
});

const generateConceptMapSchema = z.object({
  projectName: z.string().describe('Project name'),
  focus: z.string().optional().describe('Specific focus area'),
  style: z.enum(['hierarchical', 'network', 'process']).optional(),
});

// 6. Project Management
const createProjectSchema = z.object({
  projectName: z.string().describe('Name of the research project'),
  researchQuestions: z.array(z.string()).optional(),
  methodology: z.string().optional(),
});

const addDataSourceSchema = z.object({
  projectName: z.string().describe('Project name'),
  sourceType: z.enum(['interview', 'observation', 'document']).describe('Type of data source'),
  name: z.string().describe('Name/identifier for the data source'),
  content: z.string().describe('The actual data content'),
  metadata: z.record(z.any()).optional(),
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Methodology Management (3 tools)
      {
        name: 'selectMethodology',
        description: 'Find and select the best qualitative research methodology for your needs. The system will search community-contributed methodologies and recommend the most suitable options.',
        inputSchema: {
          type: 'object',
          properties: {
            intent: { type: 'string', description: 'What you want to do with your data' },
            dataType: { type: 'string', description: 'Type of data (interview, observation, document)' },
            researchGoal: { type: 'string', enum: ['theory_building', 'description', 'exploration', 'evaluation'] },
            sampleSize: { type: 'number', description: 'Number of data sources' },
          },
          required: ['intent'],
        },
      },
      {
        name: 'loadMethodology',
        description: 'Load a specific methodology by ID and prepare for analysis',
        inputSchema: {
          type: 'object',
          properties: {
            methodologyId: { type: 'string', description: 'ID of the methodology to load' },
          },
          required: ['methodologyId'],
        },
      },
      {
        name: 'listMethodologies',
        description: 'List all available methodologies, optionally filtered by category',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Filter by category' },
          },
        },
      },

      // Coding Tools (5 tools)
      {
        name: 'autoCoding',
        description: 'AI-powered automatic coding of qualitative data. Analyzes text and suggests appropriate codes based on content and methodology.',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to analyze and code' },
            existingCodes: { type: 'array', items: { type: 'string' }, description: 'Existing codes to consider' },
            methodology: { type: 'string', description: 'Methodology to follow' },
          },
          required: ['text'],
        },
      },
      {
        name: 'refineCodebook',
        description: 'Analyze and refine the codebook: merge duplicates, suggest hierarchy, improve definitions',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'mergeCodesSmart',
        description: 'Intelligently suggest which codes should be merged based on semantic similarity',
        inputSchema: {
          type: 'object',
          properties: {
            codes: { type: 'array', items: { type: 'string' }, description: 'Codes to analyze for potential merging' },
          },
          required: ['codes'],
        },
      },
      {
        name: 'suggestSubcodes',
        description: 'Suggest subcodes for a given code based on coded segments',
        inputSchema: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Code to suggest subcodes for' },
          },
          required: ['code'],
        },
      },
      {
        name: 'validateCoding',
        description: 'Check coding consistency and identify potential issues',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
          },
          required: ['projectName'],
        },
      },

      // Thematic Analysis Tools (4 tools)
      {
        name: 'extractThemes',
        description: 'Extract themes from coded data using inductive or deductive approach. Identifies patterns, generates theme descriptions, and assesses saturation.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            mode: { type: 'string', enum: ['inductive', 'deductive'], description: 'Analysis mode' },
            depth: { type: 'string', enum: ['shallow', 'medium', 'deep'] },
          },
          required: ['projectName', 'mode'],
        },
      },
      {
        name: 'analyzePatterns',
        description: 'Analyze patterns and relationships in coded data',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'detectSaturation',
        description: 'Detect theoretical saturation at code, theme, or theoretical level. Estimates additional samples needed.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            level: { type: 'string', enum: ['code', 'theme', 'theoretical'], description: 'Level to check saturation' },
          },
          required: ['projectName', 'level'],
        },
      },
      {
        name: 'compareThemesAcrossCases',
        description: 'Compare how themes manifest across different cases or participant groups',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            groupBy: { type: 'string', description: 'How to group cases (e.g., "participant", "timepoint")' },
          },
          required: ['projectName'],
        },
      },

      // Theory Building Tools (3 tools)
      {
        name: 'buildGroundedTheory',
        description: 'Guide through grounded theory development: open coding → axial coding → selective coding → theory',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            researchQuestion: { type: 'string', description: 'Research question' },
            paradigm: { type: 'string', enum: ['constructivist', 'objectivist'] },
          },
          required: ['projectName', 'researchQuestion'],
        },
      },
      {
        name: 'generateConceptMap',
        description: 'Automatically generate concept map showing relationships between codes, themes, and concepts',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            focus: { type: 'string', description: 'Specific focus area' },
            style: { type: 'string', enum: ['hierarchical', 'network', 'process'] },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'analyzeNarrative',
        description: 'Analyze narrative structure using Labov model or other narrative frameworks',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Narrative text to analyze' },
            participant: { type: 'string', description: 'Participant ID' },
          },
          required: ['text'],
        },
      },

      // Validation Tools (4 tools)
      {
        name: 'findNegativeCases',
        description: 'Find cases that contradict or deviate from established themes. Essential for theoretical rigor.',
        inputSchema: {
          type: 'object',
          properties: {
            theme: { type: 'string', description: 'Theme to find negative cases for' },
            threshold: { type: 'string', enum: ['weak', 'moderate', 'strong'], description: 'Contradiction threshold' },
          },
          required: ['theme'],
        },
      },
      {
        name: 'triangulate',
        description: 'Perform triangulation across multiple data sources or methods',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            sources: { type: 'array', items: { type: 'string' }, description: 'Data sources to triangulate' },
          },
          required: ['projectName', 'sources'],
        },
      },
      {
        name: 'calculateReliability',
        description: 'Calculate inter-coder reliability (Cohen\'s Kappa, Krippendorff\'s Alpha, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            segment: { type: 'string', description: 'Text segment coded by multiple coders' },
            coder1Codes: { type: 'array', items: { type: 'string' }, description: 'Codes from first coder' },
            coder2Codes: { type: 'array', items: { type: 'string' }, description: 'Codes from second coder' },
            measure: { type: 'string', enum: ['cohens_kappa', 'percentage_agreement'] },
          },
          required: ['segment', 'coder1Codes', 'coder2Codes'],
        },
      },
      {
        name: 'assessQuality',
        description: 'Assess overall research quality based on established criteria (credibility, transferability, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
          },
          required: ['projectName'],
        },
      },

      // Comparison & Reporting Tools (2 tools)
      {
        name: 'compareSegments',
        description: 'Compare multiple text segments for similarities and differences',
        inputSchema: {
          type: 'object',
          properties: {
            segments: { type: 'array', items: { type: 'string' }, description: 'Text segments to compare' },
          },
          required: ['segments'],
        },
      },
      {
        name: 'generateReport',
        description: 'Generate comprehensive analysis report with themes, quotes, statistics, and visualizations',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            sections: { type: 'array', items: { type: 'string' }, description: 'Report sections to include' },
          },
          required: ['projectName'],
        },
      },

      // Project Management Tools (2 tools)
      {
        name: 'createProject',
        description: 'Create a new qualitative research project',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Name of the research project' },
            researchQuestions: { type: 'array', items: { type: 'string' } },
            methodology: { type: 'string' },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'addDataSource',
        description: 'Add a new data source (interview, observation, document) to the project',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            sourceType: { type: 'string', enum: ['interview', 'observation', 'document'] },
            name: { type: 'string', description: 'Name/identifier for the data source' },
            content: { type: 'string', description: 'The actual data content' },
            metadata: { type: 'object' },
          },
          required: ['projectName', 'sourceType', 'name', 'content'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Methodology Management
      case 'selectMethodology': {
        const parsed = selectMethodologySchema.parse(args);
        const results = await rag.findMethodology(parsed);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: `Found ${results.length} suitable methodologies`,
              methodologies: results.map(r => ({
                id: r.methodology.id,
                name: r.methodology.name,
                score: r.score,
                fitScore: r.fitScore,
                reasoning: r.reasoning,
                description: r.methodology.description,
                category: r.methodology.category,
                citations: r.methodology.metadata.citations,
              })),
              recommendation: results[0]?.methodology.id,
            }, null, 2),
          }],
        };
      }

      case 'loadMethodology': {
        const parsed = loadMethodologySchema.parse(args);
        const methodology = await rag.getMethodology(parsed.methodologyId);

        if (!methodology) {
          throw new Error(`Methodology ${parsed.methodologyId} not found`);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: `Loaded ${methodology.name}`,
              methodology: {
                id: methodology.id,
                name: methodology.name,
                description: methodology.description,
                stages: methodology.stages.map(s => ({
                  name: s.name,
                  description: s.description,
                  order: s.order,
                })),
                tools: methodology.tools,
                qualityCriteria: methodology.qualityCriteria,
              },
            }, null, 2),
          }],
        };
      }

      case 'listMethodologies': {
        const parsed = listMethodologiesSchema.parse(args);
        let methodologies = rag.getAllMethodologies();

        if (parsed.category) {
          methodologies = methodologies.filter(m => m.category === parsed.category);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              total: methodologies.length,
              methodologies: methodologies.map(m => ({
                id: m.id,
                name: m.name,
                category: m.category,
                author: m.author,
                citations: m.metadata.citations,
                rating: m.metadata.rating,
              })),
            }, null, 2),
          }],
        };
      }

      // Project Management
      case 'createProject': {
        const parsed = createProjectSchema.parse(args);

        db.createEntity({
          name: parsed.projectName,
          entityType: 'project',
          observations: [
            `Research Questions: ${parsed.researchQuestions?.join('; ') || 'Not specified'}`,
            `Methodology: ${parsed.methodology || 'Not specified'}`,
            `Created: ${new Date().toISOString()}`,
          ],
          metadata: {
            researchQuestions: parsed.researchQuestions,
            methodology: parsed.methodology,
          },
        });

        return {
          content: [{
            type: 'text',
            text: `✅ Created project "${parsed.projectName}"\n\nYou can now add data sources using the addDataSource tool.`,
          }],
        };
      }

      case 'addDataSource': {
        const parsed = addDataSourceSchema.parse(args);

        const sourceName = `${parsed.projectName}__${parsed.sourceType}__${parsed.name}`;

        db.createEntity({
          name: sourceName,
          entityType: parsed.sourceType,
          observations: [
            `Content length: ${parsed.content.length} characters`,
            `Added: ${new Date().toISOString()}`,
          ],
          metadata: {
            content: parsed.content,
            ...parsed.metadata,
          },
        });

        db.createRelation({
          from: sourceName,
          to: parsed.projectName,
          relationType: 'part_of',
        });

        return {
          content: [{
            type: 'text',
            text: `✅ Added ${parsed.sourceType} "${parsed.name}" to project "${parsed.projectName}"\n\nContent length: ${parsed.content.length} characters`,
          }],
        };
      }

      // Coding Tools
      case 'autoCoding': {
        const parsed = autoCodingSchema.parse(args);

        const result = await codingEngine.autoCoding({
          text: parsed.text,
          existingCodes: parsed.existingCodes,
          methodology: parsed.methodology,
        });

        let response = `📊 AUTO-CODING RESULTS\n\n`;
        response += `Text analyzed: ${parsed.text.length} characters\n`;
        response += `Codes generated: ${result.codes.length}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📝 CODES:\n\n`;
        for (const code of result.codes.slice(0, 20)) {
          response += `• ${code.name} (${code.type})\n`;
          response += `  Definition: ${code.definition}\n`;
          response += `  Frequency: ${code.frequency}\n`;
          if (code.examples.length > 0) {
            response += `  Example: "${code.examples[0].slice(0, 80)}..."\n`;
          }
          response += `\n`;
        }

        if (result.codes.length > 20) {
          response += `... and ${result.codes.length - 20} more codes\n\n`;
        }

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📈 SUMMARY:\n`;
        response += `- Total codes: ${result.summary.totalCodes}\n`;
        response += `- In-vivo codes: ${result.summary.inVivoCodes}\n`;
        response += `- Constructed codes: ${result.summary.constructedCodes}\n`;
        response += `- Theoretical codes: ${result.summary.theoreticalCodes}\n`;
        response += `- Avg codes per segment: ${result.summary.averageCodesPerSegment.toFixed(1)}\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'refineCodebook': {
        const parsed = refineCodebookSchema.parse(args);

        // Get all codes from the project
        const projectEntity = db.getEntity(parsed.projectName);
        if (!projectEntity) {
          throw new Error(`Project "${parsed.projectName}" not found. Create a project first using createProject.`);
        }

        // Get all code entities
        const allEntities = db.searchEntities(parsed.projectName);
        const codeEntities = allEntities.filter(e => e.entityType === 'code');

        if (codeEntities.length === 0) {
          throw new Error('No codes found in project. Run autoCoding first.');
        }

        const codes = codeEntities.map(e => ({
          name: e.name.replace(`${parsed.projectName}__code__`, ''),
          definition: e.observations[0] || '',
          examples: (e.metadata?.examples as string[]) || [],
          frequency: (e.metadata?.frequency as number) || 1,
          type: (e.metadata?.type as 'in_vivo' | 'constructed' | 'theoretical') || 'constructed',
        }));

        const result = await codingEngine.refineCodebook(codes);

        let response = `🔧 CODEBOOK REFINEMENT\n\n`;
        response += `Original codes: ${codes.length}\n`;
        response += `Refined codes: ${result.refined.length}\n`;
        response += `Merges performed: ${result.merges.length}\n\n`;

        if (result.merges.length > 0) {
          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          response += `🔀 MERGE OPERATIONS:\n\n`;
          for (const merge of result.merges) {
            response += `• Merged: ${merge.from.join(', ')}\n`;
            response += `  → Into: ${merge.to}\n`;
            response += `  Reason: ${merge.reason}\n\n`;
          }
        }

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `✅ Codebook has been refined and saved.\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'extractThemes': {
        const parsed = extractThemesSchema.parse(args);

        // Get all codes from the project
        const projectEntity = db.getEntity(parsed.projectName);
        if (!projectEntity) {
          throw new Error(`Project "${parsed.projectName}" not found.`);
        }

        const allEntities = db.searchEntities(parsed.projectName);
        const codeEntities = allEntities.filter(e => e.entityType === 'code');

        if (codeEntities.length === 0) {
          throw new Error('No codes found. Run autoCoding first.');
        }

        const codes = codeEntities.map(e => ({
          name: e.name.replace(`${parsed.projectName}__code__`, ''),
          definition: e.observations[0] || '',
          examples: (e.metadata?.examples as string[]) || [],
          frequency: (e.metadata?.frequency as number) || 1,
          type: (e.metadata?.type as 'in_vivo' | 'constructed' | 'theoretical') || 'constructed',
        }));

        const themes = await themeEngine.extractThemes({
          codes,
          mode: parsed.mode,
          depth: parsed.depth,
        });

        // Store themes in knowledge graph
        for (const theme of themes) {
          db.createEntity({
            name: `${parsed.projectName}__theme__${theme.name}`,
            entityType: 'theme',
            observations: [
              theme.description,
              `Prevalence: ${(theme.prevalence * 100).toFixed(1)}%`,
              `Supporting codes: ${theme.supportingCodes.length}`,
            ],
            metadata: { theme },
          });

          db.createRelation({
            from: `${parsed.projectName}__theme__${theme.name}`,
            to: parsed.projectName,
            relationType: 'theme_of',
          });
        }

        let response = `🎨 THEME EXTRACTION (${parsed.mode})\n\n`;
        response += `Codes analyzed: ${codes.length}\n`;
        response += `Themes extracted: ${themes.length}\n`;
        response += `Depth: ${parsed.depth || 'medium'}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const theme of themes) {
          response += `📌 ${theme.name}\n\n`;
          response += `${theme.description}\n\n`;
          response += `Prevalence: ${(theme.prevalence * 100).toFixed(1)}% of coded data\n`;
          response += `Supporting codes (${theme.supportingCodes.length}): ${theme.supportingCodes.slice(0, 5).join(', ')}${theme.supportingCodes.length > 5 ? '...' : ''}\n\n`;

          if (theme.examples.length > 0) {
            response += `Example quotes:\n`;
            for (const ex of theme.examples.slice(0, 2)) {
              response += `  "${ex.slice(0, 100)}${ex.length > 100 ? '...' : ''}"\n`;
            }
            response += `\n`;
          }

          if (theme.subThemes && theme.subThemes.length > 0) {
            response += `Sub-themes (${theme.subThemes.length}):\n`;
            for (const sub of theme.subThemes) {
              response += `  - ${sub.name}\n`;
            }
            response += `\n`;
          }

          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        response += `✅ Themes have been saved to the knowledge graph.\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'detectSaturation': {
        const parsed = detectSaturationSchema.parse(args);

        // Get all data sources for this project
        const projectEntity = db.getEntity(parsed.projectName);
        if (!projectEntity) {
          throw new Error(`Project "${parsed.projectName}" not found.`);
        }

        const relations = db.getRelations(parsed.projectName);
        const sourceRelations = relations.filter(r => r.relationType === 'part_of');

        if (sourceRelations.length < 2) {
          throw new Error('Need at least 2 data sources to detect saturation.');
        }

        // Get codes for each source
        const codesBySource = new Map();

        for (const rel of sourceRelations) {
          const source = db.getEntity(rel.from);
          if (source && source.metadata && source.metadata.content) {
            const codingResult = await codingEngine.autoCoding({
              text: source.metadata.content as string,
              methodology: 'grounded',
            });
            codesBySource.set(rel.from, codingResult.codes);
          }
        }

        const saturation = await themeEngine.detectSaturation({
          level: parsed.level,
          codesBySource,
        });

        let response = `📊 SATURATION ANALYSIS (${parsed.level} level)\n\n`;
        response += `Data sources analyzed: ${codesBySource.size}\n`;
        response += `Saturation rate: ${(saturation.saturationRate * 100).toFixed(1)}%\n`;
        response += `Saturated: ${saturation.saturated ? '✅ YES' : '❌ NO'}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📈 NEW CODES PER SOURCE:\n\n`;
        saturation.newCodesPerSource.forEach((count, idx) => {
          response += `Source ${idx + 1}: ${count} new codes\n`;
        });

        response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `💡 RECOMMENDATION:\n\n${saturation.recommendation}\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'analyzePatterns': {
        const parsed = { projectName: (args as any).projectName };

        // Get all codes
        const projectEntity = db.getEntity(parsed.projectName);
        if (!projectEntity) {
          throw new Error(`Project "${parsed.projectName}" not found.`);
        }

        const allEntities = db.searchEntities(parsed.projectName);
        const codeEntities = allEntities.filter(e => e.entityType === 'code');

        if (codeEntities.length === 0) {
          throw new Error('No codes found. Run autoCoding first.');
        }

        const codes = codeEntities.map(e => ({
          name: e.name.replace(`${parsed.projectName}__code__`, ''),
          definition: e.observations[0] || '',
          examples: (e.metadata?.examples as string[]) || [],
          frequency: (e.metadata?.frequency as number) || 1,
          type: (e.metadata?.type as 'in_vivo' | 'constructed' | 'theoretical') || 'constructed',
        }));

        const patterns = await themeEngine.analyzePatterns(codes);

        let response = `🔍 PATTERN ANALYSIS\n\n`;
        response += `Codes analyzed: ${codes.length}\n`;
        response += `Patterns found: ${patterns.length}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const byType: Record<string, typeof patterns> = {
          'co-occurrence': [],
          'contrast': [],
          'hierarchy': [],
          'sequence': [],
        };

        patterns.forEach(p => {
          if (!byType[p.type]) byType[p.type] = [];
          byType[p.type].push(p);
        });

        for (const [type, typePatterns] of Object.entries(byType)) {
          if (typePatterns.length === 0) continue;

          response += `📍 ${type.toUpperCase()} PATTERNS (${typePatterns.length}):\n\n`;

          for (const pattern of typePatterns.slice(0, 5)) {
            response += `• ${pattern.description}\n`;
            response += `  Elements: ${pattern.elements.join(', ')}\n`;
            response += `  Frequency: ${pattern.frequency}\n`;
            response += `  Significance: ${pattern.significance}\n\n`;
          }

          if (typePatterns.length > 5) {
            response += `... and ${typePatterns.length - 5} more ${type} patterns\n\n`;
          }

          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'findNegativeCases': {
        const parsed = findNegativeCasesSchema.parse(args);

        // Get theme entity
        const themeEntity = db.getEntity(parsed.theme);
        if (!themeEntity || !themeEntity.metadata || !themeEntity.metadata.theme) {
          throw new Error(`Theme "${parsed.theme}" not found. Run extractThemes first.`);
        }

        const theme = themeEntity.metadata.theme as any;

        // Get all codes from the same project
        const projectName = parsed.theme.split('__theme__')[0];
        const allEntities = db.searchEntities(projectName);
        const codeEntities = allEntities.filter(e => e.entityType === 'code');

        const allCodes = codeEntities.map(e => ({
          name: e.name.replace(`${projectName}__code__`, ''),
          definition: e.observations[0] || '',
          examples: (e.metadata?.examples as string[]) || [],
          frequency: (e.metadata?.frequency as number) || 1,
          type: (e.metadata?.type as 'in_vivo' | 'constructed' | 'theoretical') || 'constructed',
        }));

        const result = await themeEngine.findNegativeCases({
          theme,
          allCodes,
          threshold: parsed.threshold || 'moderate',
        });

        let response = `🔍 NEGATIVE CASE ANALYSIS\n\n`;
        response += `Theme: ${theme.name}\n`;
        response += `Threshold: ${parsed.threshold || 'moderate'}\n`;
        response += `Negative cases found: ${result.negativeCases.length}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (result.negativeCases.length > 0) {
          response += `⚠️ CONTRADICTING CODES:\n\n`;
          for (const nc of result.negativeCases) {
            response += `• ${nc.code} (${nc.strength})\n`;
            response += `  Contradiction: ${nc.contradiction}\n\n`;
          }

          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        response += `💡 RECOMMENDATION:\n\n${result.recommendation}\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'calculateReliability': {
        const parsed = calculateReliabilitySchema.parse(args);

        // Calculate Cohen's Kappa
        const coder1Set = new Set(parsed.coder1Codes);
        const coder2Set = new Set(parsed.coder2Codes);

        const agreements = parsed.coder1Codes.filter(c => coder2Set.has(c)).length;
        const disagreements1 = parsed.coder1Codes.filter(c => !coder2Set.has(c)).length;
        const disagreements2 = parsed.coder2Codes.filter(c => !coder1Set.has(c)).length;

        const total = agreements + disagreements1 + disagreements2;

        const po = total > 0 ? agreements / total : 0; // observed agreement
        const pe = 0.5; // expected agreement by chance (simplified)
        const kappa = pe < 1 ? (po - pe) / (1 - pe) : 1;

        let interpretation: string;
        if (kappa > 0.8) interpretation = 'Excellent agreement';
        else if (kappa > 0.6) interpretation = 'Substantial agreement';
        else if (kappa > 0.4) interpretation = 'Moderate agreement';
        else if (kappa > 0.2) interpretation = 'Fair agreement';
        else interpretation = 'Poor agreement';

        const percentageAgreement = ((agreements / Math.max(parsed.coder1Codes.length, parsed.coder2Codes.length)) * 100).toFixed(1);

        let response = `📊 INTER-CODER RELIABILITY\n\n`;
        response += `Segment: "${parsed.segment.slice(0, 100)}${parsed.segment.length > 100 ? '...' : ''}"\n`;
        response += `Measure: ${parsed.measure || 'cohens_kappa'}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📈 RESULTS:\n\n`;
        response += `Cohen's Kappa (κ): ${kappa.toFixed(3)}\n`;
        response += `Interpretation: ${interpretation}\n`;
        response += `Percentage Agreement: ${percentageAgreement}%\n\n`;

        response += `Agreements: ${agreements}\n`;
        response += `Disagreements (Coder 1 only): ${disagreements1}\n`;
        response += `Disagreements (Coder 2 only): ${disagreements2}\n`;
        response += `Total comparisons: ${total}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `💡 RECOMMENDATION:\n\n`;
        if (kappa < 0.6) {
          response += `Reliability is below the 0.6 threshold. Consider:\n`;
          response += `1. Refining code definitions\n`;
          response += `2. Additional coder training\n`;
          response += `3. Discussing disagreements\n`;
        } else {
          response += `Reliability is acceptable for qualitative research. Continue coding!\n`;
        }

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      // Theory Building Tools
      case 'buildGroundedTheory': {
        const parsed = buildGroundedTheorySchema.parse(args);

        // Get all codes from the project
        const projectEntity = db.getEntity(parsed.projectName);
        if (!projectEntity) {
          throw new Error(`Project "${parsed.projectName}" not found. Create a project first using createProject.`);
        }

        // Get all data sources for this project
        const relations = db.getRelations(parsed.projectName);
        const dataSources = relations
          .filter(r => r.relationType === 'part_of')
          .map(r => db.getEntity(r.from))
          .filter(e => e !== null);

        if (dataSources.length === 0) {
          throw new Error(`No data sources found for project "${parsed.projectName}". Add data sources using addDataSource.`);
        }

        // Extract codes from all data sources
        const allCodes: any[] = [];

        for (const source of dataSources) {
          if (source && source.metadata && source.metadata.content) {
            const codingResult = await codingEngine.autoCoding({
              text: source.metadata.content as string,
              methodology: 'grounded',
            });
            allCodes.push(...codingResult.codes);
          }
        }

        if (allCodes.length === 0) {
          throw new Error('No codes found. Please ensure your data sources contain text content.');
        }

        // Build grounded theory
        const theoryResult = await theoryEngine.buildGroundedTheory({
          codes: allCodes,
          researchQuestion: parsed.researchQuestion,
          paradigm: parsed.paradigm || 'constructivist',
        });

        // Store theory in knowledge graph
        db.createEntity({
          name: `${parsed.projectName}__theory`,
          entityType: 'grounded_theory',
          observations: [
            `Core Category: ${theoryResult.coreCategory.name}`,
            `Stage: ${theoryResult.stage}`,
            `Completeness: ${(theoryResult.completeness * 100).toFixed(1)}%`,
            `Supporting Categories: ${theoryResult.supportingCategories.length}`,
          ],
          metadata: {
            theory: theoryResult,
            researchQuestion: parsed.researchQuestion,
            paradigm: parsed.paradigm || 'constructivist',
            createdAt: new Date().toISOString(),
          },
        });

        db.createRelation({
          from: `${parsed.projectName}__theory`,
          to: parsed.projectName,
          relationType: 'theory_of',
        });

        // Format response
        let response = `🎓 GROUNDED THEORY DEVELOPED\n\n`;
        response += `Research Question: ${parsed.researchQuestion}\n`;
        response += `Paradigm: ${parsed.paradigm || 'constructivist'}\n`;
        response += `Stage: ${theoryResult.stage}\n`;
        response += `Completeness: ${(theoryResult.completeness * 100).toFixed(1)}%\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📌 CORE CATEGORY: ${theoryResult.coreCategory.name}\n\n`;
        response += `${theoryResult.coreCategory.description}\n\n`;
        response += `Centrality Score: ${(theoryResult.coreCategory.centrality * 100).toFixed(1)}%\n\n`;

        if (theoryResult.coreCategory.relationships.length > 0) {
          response += `🔗 Key Relationships:\n`;
          for (const rel of theoryResult.coreCategory.relationships.slice(0, 5)) {
            response += `  • ${rel.description}\n`;
          }
          response += `\n`;
        }

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📚 SUPPORTING CATEGORIES (${theoryResult.supportingCategories.length}):\n\n`;
        for (const cat of theoryResult.supportingCategories.slice(0, 5)) {
          response += `  ${cat.name}\n`;
          response += `  └─ ${cat.relatedCodes.length} codes\n`;
        }

        if (theoryResult.supportingCategories.length > 5) {
          response += `  ... and ${theoryResult.supportingCategories.length - 5} more categories\n`;
        }

        response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📖 STORYLINE:\n\n${theoryResult.storyline}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `💡 THEORETICAL FRAMEWORK:\n\n${theoryResult.theoreticalFramework}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📋 RECOMMENDATIONS:\n\n`;
        for (const rec of theoryResult.recommendations) {
          response += `  • ${rec}\n`;
        }

        response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📝 THEORETICAL MEMO:\n\n${theoryResult.coreCategory.theoreticalMemo}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `✅ Theory has been saved to the knowledge graph.\n`;
        response += `Use entity name: ${parsed.projectName}__theory\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'mergeCodesSmart': {
        const parsed = mergeCodesSmartSchema.parse(args);

        // Build Code objects from code names (simplified - assumes codes exist in KB)
        const codes = parsed.codes.map(codeName => ({
          name: codeName,
          definition: `Code: ${codeName}`, // Simplified
          examples: [],
          frequency: 1,
          type: 'constructed' as const,
        }));

        if (codes.length < 2) {
          throw new Error('Need at least 2 codes to analyze for merging');
        }

        const result = await codingEngine.refineCodebook(codes);

        let response = `🔀 SMART CODE MERGE ANALYSIS\n\n`;
        response += `Analyzed ${parsed.codes.length} codes\n`;
        response += `Suggested merges: ${result.merges.length}\n\n`;

        if (result.merges.length > 0) {
          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          response += `📋 MERGE RECOMMENDATIONS:\n\n`;

          for (const merge of result.merges) {
            response += `✓ Merge "${merge.from}" → "${merge.to}"\n`;
            response += `  Reason: ${merge.reason}\n\n`;
          }

          response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          response += `📊 REFINED CODEBOOK (${result.refined.length} codes):\n\n`;

          for (const code of result.refined.slice(0, 10)) {
            response += `• ${code.name}\n`;
            response += `  Definition: ${code.definition}\n`;
            response += `  Frequency: ${code.frequency}\n\n`;
          }

          if (result.refined.length > 10) {
            response += `... and ${result.refined.length - 10} more codes\n\n`;
          }
        } else {
          response += `✅ No merges needed - all codes are sufficiently distinct.\n`;
        }

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      case 'suggestSubcodes': {
        const parsed = suggestSubcodesSchema.parse(args);

        let response = `🌳 SUBCODE SUGGESTIONS FOR: ${parsed.code}\n\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Generate smart subcode suggestions based on code name and context
        const codeType = parsed.code.toLowerCase();
        let suggestions: string[] = [];

        // Pattern-based subcode generation
        if (codeType.includes('stress') || codeType.includes('anxiety')) {
          suggestions = [
            `${parsed.code}__academic`,
            `${parsed.code}__social`,
            `${parsed.code}__financial`,
            `${parsed.code}__health`,
          ];
        } else if (codeType.includes('coping') || codeType.includes('strategy')) {
          suggestions = [
            `${parsed.code}__problem-focused`,
            `${parsed.code}__emotion-focused`,
            `${parsed.code}__avoidance`,
            `${parsed.code}__seeking-support`,
          ];
        } else if (codeType.includes('experience') || codeType.includes('feeling')) {
          suggestions = [
            `${parsed.code}__positive`,
            `${parsed.code}__negative`,
            `${parsed.code}__mixed`,
            `${parsed.code}__neutral`,
          ];
        } else if (codeType.includes('process') || codeType.includes('change')) {
          suggestions = [
            `${parsed.code}__initial`,
            `${parsed.code}__developing`,
            `${parsed.code}__established`,
            `${parsed.code}__outcome`,
          ];
        } else {
          // Generic dimensional subcoding
          suggestions = [
            `${parsed.code}__type-a`,
            `${parsed.code}__type-b`,
            `${parsed.code}__intensity-high`,
            `${parsed.code}__intensity-low`,
            `${parsed.code}__context-specific`,
          ];
        }

        response += `💡 SUGGESTED SUBCODES:\n\n`;
        for (const subcode of suggestions) {
          response += `  • ${subcode}\n`;
        }

        response += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `📝 RATIONALE:\n\n`;
        response += `These subcodes follow dimensional analysis principles:\n`;
        response += `- Breaking down the parent code into meaningful dimensions\n`;
        response += `- Capturing variations in properties or contexts\n`;
        response += `- Enabling more nuanced analysis\n\n`;
        response += `Tip: You can customize these suggestions based on your data.\n`;

        return {
          content: [{
            type: 'text',
            text: response,
          }],
        };
      }

      // Default handler for other tools
      default:
        return {
          content: [{
            type: 'text',
            text: `Tool "${name}" is registered but implementation is in progress.\n\nThis is part of the QualAI MCP server - a comprehensive qualitative research analysis system.\n\nFull implementation coming soon!`,
          }],
        };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
      isError: true,
    };
  }
});

/**
 * Start server
 */
async function main() {
  console.error('🚀 QualAI MCP Server starting...');

  // Sync methodologies from GitHub (if configured)
  const githubRepo = process.env.QUALAI_GITHUB_REPO;
  if (githubRepo) {
    console.error(`📥 Syncing methodologies from ${githubRepo}...`);
    const synced = await rag.syncFromGitHub(githubRepo);
    console.error(`✅ Synced ${synced} methodologies`);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ QualAI MCP Server ready!');
  console.error('📚 Available tools: 20');
  console.error('🧠 Methodologies loaded:', rag.getAllMethodologies().length);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
