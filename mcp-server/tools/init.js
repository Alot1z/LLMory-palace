/**
 * mcp__palace__init - Initialize Palace for a project
 */

import { initPalace } from '../lib/palace-api.js';
import path from 'path';

export async function palaceInit(args) {
  const { projectPath, config = {} } = args;
  const absolutePath = path.resolve(projectPath);
  
  try {
    const { palace, isNew } = await initPalace(absolutePath, config);
    
    return {
      status: 'success',
      action: isNew ? 'created' : 'existing',
      palaceDir: path.join(absolutePath, '.palace'),
      version: palace.version || '2.6.0',
      config: {
        compressionLevel: palace.config?.compressionLevel || 3,
        languages: palace.config?.languages || [],
        framework: palace.config?.framework || null
      },
      nextSteps: [
        'Run mcp__palace__scan to analyze project files',
        'Run mcp__palace__genome to generate compressed genome'
      ]
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      projectPath: absolutePath
    };
  }
}
