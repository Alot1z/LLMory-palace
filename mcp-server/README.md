# LLMemory-Palace MCP Server

Reference-based minimal context MCP server for 90%+ token savings.

## Install

```bash
# npm
npm install @alot1z/llmemory-palace-mcp

# bun
bun add @alot1z/llmemory-palace-mcp
```

## Configure

Add to your Claude settings (`~/.claude.json`):

```json
{
  "mcpServers": {
    "palace": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@alot1z/llmemory-palace-mcp"]
    }
  }
}
```

## Tools

### mcp__palace__init
Initialize Palace for a project.

```json
{
  "projectPath": "/path/to/project",
  "config": { "compressionLevel": 3 }
}
```

Returns:
```json
{
  "status": "success",
  "palaceDir": "/path/to/project/.palace",
  "version": "2.6.0"
}
```

### mcp__palace__scan
Scan project files. Returns reference + metadata (90% token savings).

```json
{
  "projectPath": "/path/to/project",
  "force": false
}
```

Returns:
```json
{
  "ref": "palace://scan/7f3a8b2c",
  "meta": {
    "filesScanned": 156,
    "patternsDetected": 23,
    "flowsDetected": 7
  }
}
```

### mcp__palace__genome
Generate compressed genome. Returns reference + metadata (99% token savings).

```json
{
  "projectPath": "/path/to/project",
  "compressionLevel": 3
}
```

### mcp__palace__resolve_ref
Resolve a palace:// reference at specified depth.

- `depth=1`: Summary only (~50 tokens)
- `depth=2`: Outline (~200 tokens)
- `depth=3`: Full content

```json
{
  "ref": "palace://scan/7f3a8b2c",
  "depth": 1
}
```

### mcp__palace__status
Get Palace status for a project.

```json
{
  "projectPath": "/path/to/project"
}
```

## Token Savings

| Operation | Full Content | Reference Mode | Savings |
|-----------|-------------|----------------|---------|
| scan | 5000 tokens | 150 tokens | 97% |
| genome | 20000 tokens | 200 tokens | 99% |
| symbol query | 3000 tokens | 80 tokens | 97% |

## Reference System

References use `palace://` URIs:
- `palace://scan/{hash}` - Scan results
- `palace://genome/{hash}` - Genome data
- `palace://symbol/{hash}` - Symbol details
- `palace://pattern/{hash}` - Pattern data

## Bun Support
This server runs on both Node 18+ and Bun 1.0+.

```bash
# Run with Bun
bun run index.js
```

## License
MIT
