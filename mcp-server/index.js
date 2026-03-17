#!/usr/bin/env node
/**
 * LLMemory-Palace MCP Server v1.2.0
 * Reference-based minimal context MCP server for Palace
 * 
 * Runs on: Node 18+ and Bun 1.0+
 * Token savings: 90%+ vs full content
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import Palace tools
import { palaceInit } from './tools/init.js';
import { palaceScan } from './tools/scan.js';
import { palaceGenome } from './tools/genome.js';
import { palaceResolveRef } from './tools/resolve-ref.js';
import { palaceStatus } from './tools/status.js';

const SERVER_VERSION = '1.2.0';
const SERVER_NAME = 'llmemory-palace';

// Tool registry
const TOOLS = {
  mcp__palace__init: palaceInit,
  mcp__palace__scan: palaceScan,
  mcp__palace__genome: palaceGenome,
  mcp__palace__resolve_ref: palaceResolveRef,
  mcp__palace__status: palaceStatus,
};

// Tool schemas for registration
const TOOL_SCHEMAS = [
  {
    name: 'mcp__palace__init',
    description: 'Initialize Palace for a project. Creates .palace directory structure.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to project root'
        },
        config: {
          type: 'object',
          description: 'Optional Palace configuration'
        }
      },
      required: ['projectPath']
    }
  },
  {
    name: 'mcp__palace__scan',
    description: 'Scan project files and detect patterns. Returns reference + metadata (90% token savings).',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to project root'
        },
        force: {
          type: 'boolean',
          default: false,
          description: 'Force rescan even if cached'
        }
      },
      required: ['projectPath']
    }
  },
  {
    name: 'mcp__palace__genome',
    description: 'Generate compressed genome. Returns reference + metadata (99% token savings).',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to project root'
        },
        compressionLevel: {
          type: 'integer',
          minimum: 1,
          maximum: 4,
          default: 3,
          description: 'Compression level (1=minimal, 4=maximal)'
        }
      },
      required: ['projectPath']
    }
  },
  {
    name: 'mcp__palace__resolve_ref',
    description: 'Resolve a palace:// reference. depth=1: summary, depth=2: outline, depth=3: full content.',
    inputSchema: {
      type: 'object',
      properties: {
        ref: {
          type: 'string',
          description: 'palace:// reference URI to resolve'
        },
        depth: {
          type: 'integer',
          default: 1,
          minimum: 1,
          maximum: 3,
          description: 'Content depth: 1=summary, 2=outline, 3=full'
        }
      },
      required: ['ref']
    }
  },
  {
    name: 'mcp__palace__status',
    description: 'Get Palace status for a project. Returns initialization state and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to project root'
        }
      },
      required: ['projectPath']
    }
  }
];

// Create MCP server
const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOL_SCHEMAS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const handler = TOOLS[name];
  if (!handler) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: `Unknown tool: ${name}` })
      }],
      isError: true
    };
  }

  try {
    const result = await handler(args);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ 
          error: error.message,
          tool: name,
          args: args
        })
      }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME} v${SERVER_VERSION}] MCP server started`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
