/**
 * mcp__palace__scan - Scan project and return reference (90% token savings)
 */

import { getPalace, scanProject } from '../lib/palace-api.js';
import { createScanRef } from '../lib/reference.js';
import path from 'path';

export async function palaceScan(args) {
  const { projectPath, force = false } = args;
  const absolutePath = path.resolve(projectPath);
  
  try {
    const palace = await getPalace(absolutePath);
    
    // Check if scan exists and force flag
    if (!force && palace.files && palace.files.size > 0) {
      // Return cached reference
      const cachedRef = createScanRef(absolutePath, {
        files: Array.from(palace.files.keys()),
        patterns: Array.from(palace.patterns?.keys() || []),
        flows: Array.from(palace.flows?.keys() || []),
        entities: Array.from(palace.entities?.keys() || [])
      });
      
      return {
        status: 'cached',
        ref: cachedRef.ref,
        meta: cachedRef.meta,
        hint: 'Use force: true to rescan'
      };
    }
    
    // Perform scan
    const { ref, meta } = await scanProject(absolutePath, force);
    
    return {
      status: 'success',
      ref,
      meta,
      tokenSavings: {
        method: 'reference-based',
        depth: 1,
        estimatedSavings: '90%+',
        resolveWith: `mcp__palace__resolve_ref({ ref: "${ref}", depth: 2 })`
      }
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      projectPath: absolutePath,
      hint: 'Run mcp__palace__init first'
    };
  }
}
