# Excluded Files

This directory contains ignore patterns for development files that should never be pushed to git or npm.

## Files Excluded from Git

These directories and files are for local development only:

### Design & Planning
- `inspiration/` - Design inspiration and references
- `design-artifacts/` - Design documents and mockups
- `docs/` - Internal documentation
- `misc/` - Miscellaneous development files
- `wiki/` - Wiki content

### Development Tools
- `.bg-shell/` - Background shell scripts
- `.pi/` - Pi-specific configurations
- `_bmad/` - BMAD framework files
- `_bmad-output/` - BMAD output files
- `.claude/` - Claude Code configurations
- `.palace/` - Palace state files
- `skills/` - Skill definitions
- `llm-export/` - LLM export data
- `reconstructed/` - Reconstructed code
- `src/` - Source files (lib/ is used for distribution)
- `test/` - Test files
- `web/` - Web interface files

### Phase Tracking
- `PHASE*.md` - Phase completion markers
- `IMPLEMENTATION-STATUS.md` - Implementation status tracking

### Config Files
- `build.config.js` - Build configuration
- `jest.config.js` - Jest test configuration
- `test.genome` - Test genome file

## Why These Are Excluded

1. **Token Efficiency**: These files are for local development and would bloat the repository
2. **Security**: Some files may contain sensitive development information
3. **Relevance**: Not needed for package consumers
4. **Clean History**: Keeping git history clean of development artifacts

## Note

The `lib/`, `bin/`, `config/`, `mcp-server/`, and `scripts/` directories are always included as they contain the actual package code.
