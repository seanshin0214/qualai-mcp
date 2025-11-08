# QualAI GPT Configuration Guide

This directory contains everything needed to create a Custom GPT powered by QualAI MCP v2.0.0.

## 📁 Files Overview

### Core Configuration Files
- **`instructions.txt`** - Complete GPT instructions (7,500 characters)
- **`conversation-starters.txt`** - 10 suggested conversation starters
- **`knowledge-files-list.txt`** - List of 20 knowledge files to upload
- **`gpt-config.json`** - Technical configuration reference
- **`README.md`** - This file

## 🚀 Quick Setup Guide

### Step 1: Create Custom GPT
1. Go to https://chat.openai.com/gpts/editor
2. Click "Create a GPT"
3. Switch to "Configure" tab

### Step 2: Basic Information
- **Name**: `QualAI Research Assistant`
- **Description**:
  ```
  Expert qualitative research methodologist powered by QualAI MCP v2.0.0.
  Helps with methodology selection, data coding, theme extraction, grounded
  theory building, and research validation across 10 major qualitative approaches.
  ```

### Step 3: Instructions
Copy the entire content from **`instructions.txt`** and paste into the Instructions field.

### Step 4: Conversation Starters
Add these 10 conversation starters from **`conversation-starters.txt`**:
1. Help me choose the right qualitative methodology for my research question
2. I have interview transcripts - how do I start coding them systematically?
3. Can you help me build a grounded theory from my data?
4. How do I know if I've reached theoretical saturation in my study?
5. I need to analyze narratives from my participants - where do I start?
6. What's the difference between thematic analysis and grounded theory?
7. Help me validate my findings through triangulation
8. I'm doing an ethnographic study - what analysis approach should I use?
9. Can you extract themes from my coded data?
10. How do I calculate inter-coder reliability for my research?

### Step 5: Knowledge Files
Upload 20 knowledge files from the repository:

#### Core Documentation (4 files)
1. `../README.md`
2. `../IMPROVEMENTS.md`
3. `../CHANGELOG.md`
4. `../TECHNICAL_SPECIFICATION.md`

#### Methodology Definitions (10 files)
5. `../methodologies/grounded-theory-charmaz.json`
6. `../methodologies/thematic-analysis-braun-clarke.json`
7. `../methodologies/narrative-analysis.json`
8. `../methodologies/discourse-analysis.json`
9. `../methodologies/ethnography.json`
10. `../methodologies/case-study.json`
11. `../methodologies/action-research.json`
12. `../methodologies/phenomenography.json`
13. `../methodologies/hermeneutic-analysis.json`
14. `../methodologies/critical-incident-technique.json`

#### Installation & Usage (3 files)
15. `../INSTALL.md`
16. `../INSTALLATION_GUIDE.md`
17. `../INTRODUCTION.md`

#### Advanced (3 files - optional)
18. `../IMPROVEMENTS_PLAN.md`
19. Any files from `../docs/`
20. Any files from `../examples/`

### Step 6: Capabilities
Enable:
- ✅ **Code Interpreter**: ON (for data analysis)
- ❌ **Web Browsing**: OFF (use knowledge files instead)
- ❌ **DALL-E Image Generation**: OFF (not needed)

### Step 7: Additional Settings
- **Model**: GPT-4 (recommended) or GPT-4 Turbo
- **Temperature**: 0.7 (balanced creativity and precision)

## 🎯 What Your GPT Can Do

### Methodology Expertise (10 methodologies)
- Grounded Theory (Charmaz 2014)
- Thematic Analysis (Braun & Clarke 2006)
- Narrative Analysis (Riessman 2008)
- Discourse Analysis (Gee 2014)
- Ethnography (Hammersley & Atkinson 2019)
- Case Study Research (Yin 2018)
- Action Research (Reason & Bradbury 2008)
- Phenomenography (Marton 1981)
- Hermeneutic Analysis (Gadamer 1989)
- Critical Incident Technique (Flanagan 1954)

### Analysis Capabilities (20 tools)
- Automated coding (in-vivo, constructed, theoretical)
- Theme extraction (inductive/deductive)
- Pattern analysis (4 types)
- Grounded theory building (4 stages)
- Saturation detection
- Negative case analysis
- Inter-coder reliability
- Triangulation
- Quality assessment
- And more...

## 📊 Version Information

- **QualAI MCP Version**: 2.0.0
- **Release Date**: 2025-11-08
- **Score**: 100/100 ✅
- **Test Coverage**: 45/45 passing (100%)
- **Tool Completion**: 20/20 (100%)
- **Methodologies**: 10 (representing 11,260+ citations)

## 🔄 Updating Your GPT

When QualAI MCP releases new versions:

1. **Update instructions.txt**
   - Check for new tools or capabilities
   - Update version number

2. **Add new methodology files**
   - Upload any new `.json` files from `methodologies/`

3. **Refresh core documentation**
   - Re-upload `IMPROVEMENTS.md` and `CHANGELOG.md`

4. **Update conversation starters**
   - Add examples for new features

## 💡 Tips for Best Results

1. **Be specific** - Provide context about your research
2. **Share your data** - Upload transcripts or field notes
3. **Ask for explanations** - GPT will explain methodology choices
4. **Iterate** - Refine analysis through multiple passes
5. **Validate** - Use triangulation and negative case analysis

## 🆘 Troubleshooting

### "I don't see all 10 methodologies"
- Ensure all methodology JSON files are uploaded
- Check that files uploaded successfully

### "Analysis seems generic"
- Provide more context about your research
- Share specific data excerpts
- Ask for methodology-specific guidance

### "How do I use the MCP tools?"
- The GPT guides you through tools conceptually
- For actual tool execution, use Claude Desktop with MCP

## 📚 Additional Resources

- **Main Repository**: https://github.com/seanshin0214/qualai-mcp
- **MCP Documentation**: See TECHNICAL_SPECIFICATION.md
- **Installation Guide**: See INSTALL.md
- **Academic References**: See methodology JSON files

## 🤝 Contributing

Help improve this GPT configuration:
1. Test with real research projects
2. Suggest better conversation starters
3. Report issues or improvements
4. Share successful use cases

---

**Created for QualAI MCP v2.0.0**
*Last updated: 2025-11-08*
