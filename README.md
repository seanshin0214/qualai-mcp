# 🔬 QualAI - AI-Powered Qualitative Research MCP Server

> **Community-driven, RAG-enhanced qualitative research analysis powered by Claude**

Transform qualitative research with AI assistance. QualAI is a Model Context Protocol (MCP) server that brings advanced AI capabilities to qualitative data analysis while maintaining methodological rigor.

---

## 💡 Share Your Innovative Research Methods!

**QualAI grows stronger with every researcher who contributes.**

Have you developed a unique qualitative methodology? A novel coding technique? An innovative analysis approach?

**🌟 Share it with the global research community!**

When you contribute your methodology to QualAI:
- ✅ **Help thousands of researchers** worldwide discover and use your approach
- ✅ **Get cited** every time someone uses your methodology
- ✅ **Receive feedback** and improvements from peer researchers
- ✅ **Build your reputation** as a methodological innovator
- ✅ **Make qualitative research better** for everyone

**Your innovation can transform how the world does qualitative research.**

👉 [**Contribute Your Methodology**](#contributing-your-methodology) | [**Browse Community Methods**](https://github.com/qualai-community/methodologies)

---

## ✨ Revolutionary Features

### 🤖 **AI-Native Analysis**
- Automatic coding with semantic understanding
- Theme extraction with theoretical depth
- Saturation detection
- Negative case discovery
- Inter-coder reliability automation

### 🌍 **Community-Driven Methodologies**
- **RAG-powered methodology library**: Access community-contributed research methods
- **GitHub integration**: Share and discover methodologies from researchers worldwide
- **Validated approaches**: Peer-reviewed methodologies with quality ratings
- **Flexible**: Use established methods or create your own

### 🎯 **Core Tools (v1.0)**

#### Methodology Management (3)
- `selectMethodology` - AI finds the best methodology for your research
- `loadMethodology` - Load community methodologies
- `listMethodologies` - Browse available methods

#### Coding Tools (5)
- `autoCoding` - AI-powered automatic coding
- `refineCodebook` - Optimize your codebook
- `mergeCodesSmart` - Intelligent code merging
- `suggestSubcodes` - Hierarchical code suggestions
- `validateCoding` - Consistency checking

#### Thematic Analysis (4)
- `extractThemes` - Inductive/deductive theme extraction
- `analyzePatterns` - Pattern and relationship analysis
- `detectSaturation` - Theoretical saturation detection
- `compareThemesAcrossCases` - Cross-case comparison

#### Theory Building (3)
- `buildGroundedTheory` - Guided grounded theory development
- `generateConceptMap` - Automatic concept mapping
- `analyzeNarrative` - Narrative structure analysis

#### Validation (4)
- `findNegativeCases` - Negative case analysis
- `triangulate` - Multi-source triangulation
- `calculateReliability` - Inter-coder reliability
- `assessQuality` - Research quality assessment

#### Reporting (1)
- `generateReport` - Comprehensive analysis reports

---
**Note:** v1.0 includes methodology management and knowledge graph. Advanced analysis tools (auto-coding, theme extraction, etc.) are in active development for v1.1.


## 📋 Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **Operating System**: Windows 10+, macOS 11+, or Ubuntu 20.04+
- **Disk Space**: At least 500 MB free

### 🐳 Qdrant Vector Database (Optional but Recommended)

QualAI uses **Qdrant** for semantic methodology search and RAG-enhanced analysis. While QualAI can work without Qdrant (using local keyword search as fallback), **installing Qdrant significantly improves methodology recommendations** and semantic search capabilities.

#### Option 1: Docker (Recommended - Easiest)

**Using PowerShell (Windows):**

```powershell
# Install Docker Desktop if not already installed
# Download from: https://www.docker.com/products/docker-desktop

# Verify Docker is running
docker --version

# Run Qdrant container
docker run -d -p 6333:6333 -p 6334:6334 `
  -v ${PWD}/qdrant_storage:/qdrant/storage `
  --name qualai-qdrant `
  qdrant/qdrant

# Verify Qdrant is running
docker ps | Select-String "qualai-qdrant"

# Test Qdrant connection
curl http://localhost:6333
```

**Using Bash (Linux/macOS):**

```bash
# Verify Docker is running
docker --version

# Run Qdrant container
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  --name qualai-qdrant \
  qdrant/qdrant

# Verify Qdrant is running
docker ps | grep qualai-qdrant

# Test Qdrant connection
curl http://localhost:6333
```

**Stop/Start Qdrant:**

```powershell
# Stop Qdrant
docker stop qualai-qdrant

# Start Qdrant again
docker start qualai-qdrant

# Remove Qdrant (if needed)
docker rm -f qualai-qdrant
```

#### Option 2: Qdrant Cloud (No Docker Required)

If you don't want to run Docker locally:

1. Sign up for free at [Qdrant Cloud](https://cloud.qdrant.io)
2. Create a cluster
3. Get your API URL and API Key
4. Use them in the configuration (see below)

#### Option 3: Run Without Qdrant (Fallback Mode)

QualAI will automatically use local keyword search if Qdrant is not available. No additional setup required, but semantic search will be limited.

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/seanshin0214/qualai-mcp.git
cd qualai-mcp

# Install dependencies
npm install

# Build
npm run build
```

### Configure Claude Desktop

#### Basic Configuration (Without Qdrant)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\YOUR-USERNAME\\Documents\\qualai-mcp\\dist\\index.js"]
    }
  }
}
```

#### With Qdrant (Recommended for Best Performance)

If you installed Qdrant using Docker locally:

```json
{
  "mcpServers": {
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\YOUR-USERNAME\\Documents\\qualai-mcp\\dist\\index.js"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "OPENAI_API_KEY": "sk-your-openai-api-key",
        "QUALAI_GITHUB_REPO": "qualai-community/methodologies"
      }
    }
  }
}
```

If you're using Qdrant Cloud:

```json
{
  "mcpServers": {
    "qualai": {
      "command": "node",
      "args": ["C:\\Users\\YOUR-USERNAME\\Documents\\qualai-mcp\\dist\\index.js"],
      "env": {
        "QDRANT_URL": "https://your-cluster.cloud.qdrant.io:6333",
        "QDRANT_API_KEY": "your-qdrant-api-key",
        "OPENAI_API_KEY": "sk-your-openai-api-key",
        "QUALAI_GITHUB_REPO": "qualai-community/methodologies"
      }
    }
  }
}
```

**Environment Variables Explained:**

- `QDRANT_URL`: Qdrant server URL (default: `http://localhost:6333`)
- `QDRANT_API_KEY`: Required only for Qdrant Cloud (optional for local Docker)
- `OPENAI_API_KEY`: For generating text embeddings (required if using Qdrant)
- `QUALAI_GITHUB_REPO`: Community methodologies repository (default: `qualai-community/methodologies`)

### Restart Claude Desktop

That's it! QualAI is now available in Claude.

**💬 First time? Try this:**
```
"I have 15 interview transcripts about remote work experiences.
Help me choose the right methodology and start coding."
```

---

## 🌍 Community Methodologies

### Current Methodologies (10)

**Built-in:**
1. **Constructivist Grounded Theory** (Charmaz, 2014) - Complete 4-stage process with memo writing
2. **Reflexive Thematic Analysis** (Braun & Clarke, 2006) - 6-phase systematic approach
3. **Discourse Analysis** (Gee, 2014) - Language-in-use and power relations analysis
4. **Narrative Analysis** - Story structure and meaning-making
5. **Phenomenography** - Variation in ways of experiencing phenomena
6. **Ethnography** - Cultural and social patterns in context
7. **Hermeneutic Analysis** - Interpretive understanding and hermeneutic circle
8. **Case Study** (Yin/Stake) - In-depth contextual investigation
9. **Action Research** - Participatory change-oriented inquiry
10. **Critical Incident Technique** (Flanagan) - Significant events analysis

**Community Contributed:**
- *Be the first to contribute!*

### Contributing Your Methodology

**Your methodology could help thousands of researchers worldwide.**

#### Step 1: Create Your Methodology

Use our template (see CONTRIBUTING.md)

#### Step 2: Test Locally

```bash
# Place in methodologies/ directory
cp your-methodology.json qualai-mcp/methodologies/

# Restart QualAI and test
```

#### Step 3: Share with Community

1. Fork [qualai-community/methodologies](https://github.com/qualai-community/methodologies)
2. Add your methodology with documentation
3. Create Pull Request
4. Community peer review (2+ reviewers)
5. Merged and available to all! 🎉

#### Recognition

- Your name appears in methodology metadata
- Automatic citation generation
- Contributor leaderboard
- Usage statistics (opt-in)

**Ready to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│        Claude Desktop               │
│  (User Interface & Conversations)   │
└──────────────┬──────────────────────┘
               │ MCP Protocol
┌──────────────▼──────────────────────┐
│         QualAI MCP Server           │
│                                     │
│  ┌────────────────────────────┐   │
│  │  Methodology Orchestrator  │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌─────────┬─────────┬──────────┐ │
│  │ Coding  │ Thematic│ Theory   │ │
│  │ Engine  │ Engine  │ Engine   │ │
│  └─────────┴─────────┴──────────┘ │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   RAG System (Qdrant)       │  │
│  │   - Community methodologies │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   Knowledge Graph (SQLite)  │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   GitHub: qualai-community          │
│   Community Methodologies Registry  │
│   - YOUR methodology! 🌟            │
└─────────────────────────────────────┘
```

---

## 🤝 Contributing

We welcome all forms of contribution!

### Ways to Contribute

1. **📖 Share Methodologies**: Most valuable contribution!
2. **🐛 Report Bugs**: Help us improve
3. **💡 Suggest Features**: Shape QualAI's future
4. **📝 Improve Docs**: Help others learn
5. **💻 Submit Code**: Enhance functionality

---

## 📊 Roadmap

### v1.0 (Current) ✅
- [x] 10 built-in methodologies
- [x] RAG-powered methodology selection
- [x] Knowledge graph for research data
- [x] 20 analysis tools

### v1.1 (Q1 2025)
- [ ] Interpretive Phenomenological Analysis (IPA)
- [ ] Conversation Analysis
- [ ] Content Analysis
- [ ] 15+ total methodologies
- [ ] Enhanced auto-coding with GPT-4

### v1.2 (Q2 2025)
- [ ] Real-time collaboration
- [ ] Multi-language support (Korean, Spanish, Chinese)
- [ ] 25+ community methodologies
- [ ] Export to ATLAS.ti, NVivo formats

### v2.0 (Q3 2025)
- [ ] Web interface
- [ ] 50+ community methodologies
- [ ] Live interview transcription

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📞 Support & Community

- **💬 Discussions**: [GitHub Discussions](https://github.com/seanshin0214/qualai-mcp/discussions)
- **🐛 Issues**: [GitHub Issues](https://github.com/seanshin0214/qualai-mcp/issues)
- **📧 Email**: sshin@geri.kr

---

## 🌟 Final Call to Action

**To Researchers Using QualAI:**
Your research benefits from methodologies shared by others. Consider giving back!

**To Methodology Innovators:**
Your unique approach could revolutionize how thousands conduct research. Share it!

**To the Qualitative Research Community:**
Together, we're building the world's most comprehensive, open, and accessible methodology library.

**Let's transform qualitative research together.**

[**→ Start Contributing Today**](https://github.com/qualai-community/methodologies)

---

**Made with ❤️ by researchers, for researchers**

**Version**: 1.0.0
**Last Updated**: 2025-11-02
