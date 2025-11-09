# QualAI MCP - Quick Start Guide

## Step 1: Build QualAI

```bash
cd qualai-mcp
npm install
npm run build
```

This will create `dist/index.js` file.

## Step 2: Configure Claude Desktop

### Windows

1. Open Claude Desktop config file:
   ```
   C:\Users\YOUR-USERNAME\AppData\Roaming\Claude\claude_desktop_config.json
   ```

2. Add QualAI configuration:

```json
{
  "mcpServers": {
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"]
    }
  }
}
```

**Important**: Replace `sshin` with your Windows username!

### With Qdrant (Optional - Enhanced Features)

If you want RAG-powered methodology selection:

```json
{
  "mcpServers": {
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "OPENAI_API_KEY": "sk-your-openai-api-key"
      }
    }
  }
}
```

## Step 3: Start Qdrant (Optional)

```powershell
docker run -d -p 6333:6333 -p 6334:6334 `
  -v ${PWD}/qdrant_storage:/qdrant/storage `
  --name qualai-qdrant `
  qdrant/qdrant
```

## Step 4: Restart Claude Desktop

1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. Look for the hammer icon (🔨) - if you see it, QualAI is loaded!

## Step 5: Test QualAI

Try this in Claude:

```
I have interview transcripts from 25 participants about their remote work experiences.
What methodology should I use? Can you help me start coding the data?
```

## Available Tools (20)

### Methodology Management
- `selectMethodology` - Find the best methodology
- `loadMethodology` - Load specific methodology
- `listMethodologies` - Browse all 10 methodologies

### Coding
- `autoCoding` - AI-powered coding
- `refineCodebook` - Optimize codes
- `mergeCodesSmart` - Merge similar codes
- `suggestSubcodes` - Generate subcodes
- `validateCoding` - Check consistency

### Analysis
- `extractThemes` - Find themes
- `analyzePatterns` - Discover patterns
- `detectSaturation` - Check saturation
- `compareThemesAcrossCases` - Cross-case analysis

### Theory Building
- `buildGroundedTheory` - Develop theory
- `generateConceptMap` - Visualize concepts
- `analyzeNarrative` - Narrative analysis

### Validation
- `findNegativeCases` - Find contradictions
- `triangulate` - Multi-source validation
- `calculateReliability` - Inter-coder reliability
- `assessQuality` - Quality assessment

### Reporting
- `generateReport` - Create comprehensive report

## Troubleshooting

### QualAI not showing up?

1. Check the config file path is correct
2. Make sure `dist/index.js` exists
3. Check Claude Desktop error logs:
   ```
   C:\Users\YOUR-USERNAME\AppData\Roaming\Claude\logs
   ```

### Build errors?

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Qdrant connection issues?

```powershell
# Check if Qdrant is running
docker ps | Select-String "qualai-qdrant"

# Restart Qdrant
docker restart qualai-qdrant

# Check Qdrant health
curl http://localhost:6333
```

## Next Steps

- Read [INTRODUCTION.md](INTRODUCTION.md) for methodology details
- See [TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md) for architecture
- Contribute your methodology - see [README.md](README.md#contributing-your-methodology)

## Support

- Issues: https://github.com/seanshin0214/qualai-mcp/issues
- Email: sshin@geri.kr
