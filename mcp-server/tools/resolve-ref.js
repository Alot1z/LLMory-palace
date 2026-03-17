/**
 * mcp__palace__resolve_ref - Resolve palace:// reference at specified depth
 */

import { resolveRef } from '../lib/palace-api.js';
import path from 'path';

export async function palaceResolveRef(args) {
  const { ref, depth = 1 } = args;
  
  // Validate ref format
  if (!ref.startsWith('palace://')) {
    return {
      status: 'error',
      error: 'Invalid reference format. Expected palace://{type}/{hash}',
      example: 'palace://scan/7f3a8b2c'
    };
  }
  
  // Validate depth
  if (depth < 1 || depth > 3) {
    return {
      status: 'error',
      error: 'Depth must be 1, 2, or 3',
      levels: {
        1: 'Summary only (~50 tokens)',
        2: 'Outline (~200 tokens)',
        3: 'Full content (variable)'
      }
    };
  }
  
  try {
    // Extract project path from ref context (would be passed in real impl)
    // For now, use cwd
    const projectPath = process.cwd();
    
    const result = await resolveRef(projectPath, ref, depth);
    
    return {
      status: 'success',
      ...result,
      tokenEstimate: estimateTokens(result, depth)
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      ref,
      hint: 'Reference may be stale. Run scan again.'
    };
  }
}

/**
 * Estimate token count for response
 */
function estimateTokens(result, depth) {
  const jsonStr = JSON.stringify(result);
  const charCount = jsonStr.length;
  const tokenEstimate = Math.ceil(charCount / 4); // ~4 chars per token
  
  return {
    depth,
    estimatedTokens: tokenEstimate,
    method: depth === 1 ? 'summary' : depth === 2 ? 'outline' : 'full'
  };
}
