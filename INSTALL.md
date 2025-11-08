# 🚀 QualAI Installation Guide

## ✅ Installation Complete!

Your QualAI MCP server has been successfully built and is ready to use.

---

## 📍 Next Steps: Configure Claude Desktop

### Step 1: Open Claude Desktop Configuration

The config file is located at:
```
C:\Users\sshin\AppData\Roaming\Claude\claude_desktop_config.json
```

### Step 2: Add QualAI to the config

Add this section to `mcpServers` (after the last server, before the closing `}`):

```json
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"]
    }
```

**Full example** (add the comma after the previous server):
```json
{
  "permissions": {
    "mode": "ask"
  },
  "mcpServers": {
    "your-other-server": {
      ...
    },
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"]
    }
  }
}
```

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Reopen Claude Desktop
3. Start a new conversation

---

## ✨ Verify Installation

In a new Claude conversation, ask:

```
Do you have access to QualAI tools?
```

Claude should respond with information about the 20 available qualitative research tools!

---

## 🎯 Quick Test

Try this example:

```
I'm doing qualitative research on healthcare experiences.
I have 10 interview transcripts. What methodology should I use?
```

Claude will use the `selectMethodology` tool to recommend appropriate research methodologies!

---

## 📚 Available Tools (20 total)

### Methodology Management
- `selectMethodology` - Find best methodology for your research
- `loadMethodology` - Load specific methodology
- `listMethodologies` - Browse all methodologies

### Coding Tools
- `autoCoding` - AI-powered automatic coding
- `refineCodebook` - Optimize codebook
- `mergeCodesSmart` - Intelligent code merging
- `suggestSubcodes` - Hierarchical code suggestions
- `validateCoding` - Consistency checking

### Thematic Analysis
- `extractThemes` - Extract themes (inductive/deductive)
- `analyzePatterns` - Pattern analysis
- `detectSaturation` - Saturation detection
- `compareThemesAcrossCases` - Cross-case comparison

### Theory Building
- `buildGroundedTheory` - Grounded theory development
- `generateConceptMap` - Concept mapping
- `analyzeNarrative` - Narrative structure analysis

### Validation
- `findNegativeCases` - Negative case analysis
- `triangulate` - Triangulation
- `calculateReliability` - Inter-coder reliability
- `assessQuality` - Quality assessment

### Project Management
- `createProject` - Create research project
- `addDataSource` - Add interview/observation data

### Reporting
- `generateReport` - Comprehensive reports

---

## 🔧 Optional: Advanced Configuration with Qdrant

### Why Use Qdrant?

QualAI can work in two modes:
- **Without Qdrant**: Uses local keyword search (basic functionality)
- **With Qdrant**: Uses semantic search with RAG (significantly better methodology recommendations)

**Recommendation**: Install Qdrant for the best experience!

### 🐳 Step-by-Step: Installing Qdrant with Docker

#### Prerequisites

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - Verify installation by opening PowerShell and running: `docker --version`

#### Install and Run Qdrant

**Open PowerShell** and run these commands:

```powershell
# 1. Pull Qdrant Docker image
docker pull qdrant/qdrant

# 2. Create a directory for Qdrant data (optional, for persistence)
New-Item -ItemType Directory -Force -Path "$HOME\qualai-qdrant-data"

# 3. Run Qdrant container
docker run -d `
  -p 6333:6333 `
  -p 6334:6334 `
  -v "$HOME\qualai-qdrant-data:/qdrant/storage" `
  --name qualai-qdrant `
  qdrant/qdrant

# 4. Verify Qdrant is running
docker ps | Select-String "qualai-qdrant"

# 5. Test connection (should return Qdrant version info)
curl http://localhost:6333
```

**Expected output from step 5:**
```json
{"title":"qdrant - vector search engine","version":"1.x.x"}
```

#### Managing Qdrant Container

```powershell
# Check if Qdrant is running
docker ps | Select-String "qualai-qdrant"

# Stop Qdrant
docker stop qualai-qdrant

# Start Qdrant again
docker start qualai-qdrant

# View Qdrant logs
docker logs qualai-qdrant

# Remove Qdrant (if you want to uninstall)
docker stop qualai-qdrant
docker rm qualai-qdrant
```

#### Configure QualAI to Use Qdrant

Update your `claude_desktop_config.json`:

```json
"qualai": {
  "command": "node",
  "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"],
  "env": {
    "QDRANT_URL": "http://localhost:6333",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "QUALAI_GITHUB_REPO": "qualai-community/methodologies"
  }
}
```

**Important**: You need an OpenAI API key to generate embeddings for semantic search. Get one at: https://platform.openai.com/api-keys

### Alternative: Qdrant Cloud (No Docker Required)

If you prefer not to use Docker:

1. **Sign up** for Qdrant Cloud: https://cloud.qdrant.io
2. **Create a cluster** (free tier available)
3. **Get your credentials**:
   - API URL (e.g., `https://xyz.eu-central.aws.cloud.qdrant.io:6333`)
   - API Key

4. **Configure QualAI**:

```json
"qualai": {
  "command": "node",
  "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"],
  "env": {
    "QDRANT_URL": "https://your-cluster.cloud.qdrant.io:6333",
    "QDRANT_API_KEY": "your-qdrant-api-key",
    "OPENAI_API_KEY": "sk-your-openai-api-key",
    "QUALAI_GITHUB_REPO": "qualai-community/methodologies"
  }
}
```

### Configuration Without Qdrant (Fallback Mode)

QualAI will work without Qdrant, using local keyword search:

```json
"qualai": {
  "command": "node",
  "args": ["C:\\Users\\sshin\\Documents\\qualai-mcp\\dist\\index.js"]
}
```

**Note**: Methodology recommendations will be less accurate without semantic search.

---

## 📖 Included Methodologies

QualAI comes with 2 research methodologies out of the box:

1. **Constructivist Grounded Theory** (Charmaz)
   - Theory-building from data
   - Process-oriented
   - 4 stages: Initial → Focused → Theoretical coding + Memos

2. **Reflexive Thematic Analysis** (Braun & Clarke)
   - Pattern identification
   - Flexible approach
   - 6-phase process

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Rebuild the project
cd C:\Users\sshin\Documents\qualai-mcp
npm run build
```

### Tools not showing in Claude
1. Check config file syntax (valid JSON)
2. Restart Claude Desktop completely
3. Check for errors in Claude's logs

### Need to update
```bash
cd C:\Users\sshin\Documents\qualai-mcp
git pull
npm install
npm run build
# Then restart Claude Desktop
```

---

## 🎓 Next Steps

1. Read the [README](./README.md) for full documentation
2. Try the example workflows
3. Explore community methodologies
4. Contribute your own methodology!

---

## 🌟 What Makes QualAI Special?

### Traditional Qualitative Software (NVivo, MAXQDA)
- ❌ Expensive ($$$)
- ❌ Click-heavy interface
- ❌ Steep learning curve
- ❌ No AI assistance
- ❌ Closed ecosystem

### QualAI
- ✅ **Free & Open Source**
- ✅ **Conversational Interface** - Just talk to Claude
- ✅ **AI-Powered** - Auto-coding, theme extraction, saturation detection
- ✅ **Community-Driven** - Share methodologies via GitHub
- ✅ **Methodologically Rigorous** - Based on established qualitative methods
- ✅ **RAG-Enhanced** - Access community knowledge base

---

## 💡 Example Research Workflow

```
1. You: "Create a project called 'Healthcare Study'"
   → Creates project

2. You: "Add this interview transcript: [paste]"
   → Adds data to project

3. You: "What methodology should I use for theory-building?"
   → Recommends Grounded Theory

4. You: "Load Grounded Theory methodology"
   → Loads methodology with stages

5. You: "Do initial coding on my interview"
   → AI generates line-by-line codes

6. You: "Extract themes from codes"
   → Identifies emergent themes

7. You: "Check saturation"
   → Analyzes if more data needed

8. You: "Generate analysis report"
   → Produces comprehensive report
```

All through natural conversation! 🎉

---

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: See README.md
- **Community**: Join discussions

---

**You're all set! Start your qualitative research journey with AI! 🚀**
