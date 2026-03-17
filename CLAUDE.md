# LLMemory-Palace - Developer Guide

> Token-efficient guide for Claude Code

## Excluded Files

These files/directories are excluded from git and npm - do not push:

### Directories
- `inspiration/` - Design references
- `.bg-shell/` - Background scripts
- `.pi/` - Pi configs
- `_bmad/` - BMAD framework
- `_bmad-output/` - BMAD output
- `.claude/` - Claude configs
- `.palace/` - Palace state
- `design-artifacts/` - Design docs
- `llm-export/` - LLM exports
- `reconstructed/` - Reconstructed code
- `skills/` - Skill definitions
- `src/` - Source (use lib/)
- `test/` - Test files
- `web/` - Web interface
- `wiki/` - Wiki content
- `docs/` - Internal docs
- `misc/` - Misc dev files

### Files
- `PHASE*.md` - Phase markers
- `IMPLEMENTATION-STATUS.md` - Status tracking
- `build.config.js` - Build config
- `jest.config.js` - Jest config
- `test.genome` - Test genome

## Included Directories

Always include these:
- `lib/` - Main library code
- `bin/` - CLI executables
- `config/` - Configuration files
- `mcp-server/` - MCP server
- `scripts/` - Utility scripts

## Quick Commands

```bash
npm test          # Run tests
npm run build     # Build dist
npm run mcp       # Start MCP server
npm start         # Run CLI
```

## Package Info

- **Version**: 3.0.4
- **Main**: lib/palace.js
- **CLI**: bin/cli.js
- **MCP**: mcp-server/index.js
