/**
 * mcp__palace__status - Get Palace status for a project
 */

import { getStatus } from '../lib/palace-api.js';
import path from 'path';

export async function palaceStatus(args) {
  const { projectPath } = args;
  const absolutePath = path.resolve(projectPath);
  
  try {
    const status = await getStatus(absolutePath);
    
    return {
      status: 'success',
      projectPath: absolutePath,
      palace: {
        initialized: status.initialized,
        palaceDir: status.palaceDir,
        lastScan: status.lastScan,
        genomeExists: status.genomeExists,
        fileCount: status.fileCount,
        genomeSize: status.genomeSize || null
      },
      recommendations: getRecommendations(status)
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      projectPath: absolutePath
    };
  }
}

/**
 * Get recommendations based on status
 */
function getRecommendations(status) {
  const recs = [];
  
  if (!status.initialized) {
    recs.push({
      action: 'init',
      tool: 'mcp__palace__init',
      description: 'Initialize Palace for this project'
    });
  }
  
  if (status.initialized && !status.lastScan) {
    recs.push({
      action: 'scan',
      tool: 'mcp__palace__scan',
      description: 'Scan project files to detect patterns'
    });
  }
  
  if (status.lastScan && !status.genomeExists) {
    recs.push({
      action: 'genome',
      tool: 'mcp__palace__genome',
      description: 'Generate compressed genome for LLM context'
    });
  }
  
  return recs;
}
