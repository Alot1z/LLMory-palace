/**
 * mcp__palace__genome - Generate compressed genome (99% token savings)
 */

import { getPalace, generateGenome } from '../lib/palace-api.js';
import { createGenomeRef } from '../lib/reference.js';
import path from 'path';

export async function palaceGenome(args) {
  const { projectPath, compressionLevel = 3 } = args;
  const absolutePath = path.resolve(projectPath);
  
  try {
    const palace = await getPalace(absolutePath);
    
    // Check if already scanned
    if (!palace.files || palace.files.size === 0) {
      return {
        status: 'error',
        error: 'Project not scanned',
        hint: 'Run mcp__palace__scan first'
      };
    }
    
    // Generate genome
    const { ref, meta } = await generateGenome(absolutePath, compressionLevel);
    
    return {
      status: 'success',
      ref,
      meta: {
        ...meta,
        compressionLevel
      },
      tokenSavings: {
        method: 'genome-compression',
        depth: 1,
        estimatedSavings: '99%+',
        resolveWith: `mcp__palace__resolve_ref({ ref: "${ref}", depth: 2 })`
      },
      usage: {
        quickQuery: `mcp__palace__resolve_ref({ ref: "${ref}", depth: 1 })`,
        detailed: `mcp__palace__resolve_ref({ ref: "${ref}", depth: 2 })`,
        full: `mcp__palace__resolve_ref({ ref: "${ref}", depth: 3 })`
      }
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      projectPath: absolutePath
    };
  }
}
