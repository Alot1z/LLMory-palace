/**
 * Palace API Wrapper for MCP Server
 * Programmatic interface to LLMemory-Palace
 */

import { Palace } from '../../lib/palace.js';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

// Palace instance cache (LRU-style)
const palaceCache = new Map();
const MAX_CACHE_SIZE = 10;

function getCachedPalace(projectPath) {
  const normalized = path.resolve(projectPath);
  
  if (palaceCache.has(normalized)) {
    // Move to end (most recently used)
    const entry = palaceCache.get(normalized);
    palaceCache.delete(normalized);
    palaceCache.set(normalized, entry);
    return entry;
  }
  
  return null;
}

function setCachedPalace(projectPath, palace) {
  const normalized = path.resolve(projectPath);
  
  // Evict oldest if at capacity
  if (palaceCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = palaceCache.keys().next().value;
    palaceCache.delete(oldestKey);
  }
  
  palaceCache.set(normalized, palace);
}

/**
 * Initialize Palace for a project
 */
export async function initPalace(projectPath, config = {}) {
  const cached = getCachedPalace(projectPath);
  if (cached) {
    return { palace: cached, isNew: false };
  }
  
  const palace = new Palace(projectPath);
  await palace.init();
  
  // Apply config if provided
  if (Object.keys(config).length > 0) {
    palace.config = { ...palace.config, ...config };
  }
  
  setCachedPalace(projectPath, palace);
  return { palace, isNew: true };
}

/**
 * Get or create Palace instance
 */
export async function getPalace(projectPath) {
  const cached = getCachedPalace(projectPath);
  if (cached) {
    return cached;
  }
  
  // Check if .palace exists
  const palaceDir = path.join(projectPath, '.palace');
  if (!fs.existsSync(palaceDir)) {
    throw new Error(`Palace not initialized for ${projectPath}. Run init first.`);
  }
  
  const palace = new Palace(projectPath);
  await palace.load();
  
  setCachedPalace(projectPath, palace);
  return palace;
}

/**
 * Scan project and return reference
 */
export async function scanProject(projectPath, force = false) {
  const palace = await getPalace(projectPath);
  
  // Check if scan needed
  const statePath = path.join(projectPath, '.palace', 'state', 'history.json');
  const needsScan = force || !fs.existsSync(statePath);
  
  if (needsScan) {
    await palace.scan();
  }
  
  // Generate reference
  const ref = generateRef('scan', projectPath, palace.files);
  
  return {
    ref,
    meta: {
      filesScanned: palace.files.size,
      patternsDetected: palace.patterns.size,
      flowsDetected: palace.flows.size,
      entitiesFound: palace.entities.size,
      lastScan: new Date().toISOString(),
      cached: !needsScan
    }
  };
}

/**
 * Generate genome and return reference
 */
export async function generateGenome(projectPath, compressionLevel = 3) {
  const palace = await getPalace(projectPath);
  
  // Ensure scanned
  if (palace.files.size === 0) {
    await palace.scan();
  }
  
  // Generate genome
  const genome = palace.generateGenome({ compressionLevel });
  
  // Generate reference
  const ref = generateRef('genome', projectPath, genome);
  
  // Store genome for later resolution
  const genomePath = path.join(projectPath, '.palace', 'output', 'genome.json');
  fs.mkdirSync(path.dirname(genomePath), { recursive: true });
  fs.writeFileSync(genomePath, JSON.stringify(genome, null, 2));
  
  return {
    ref,
    meta: {
      size: genome.length,
      compressionRatio: genome.compressionRatio || 0,
      patternCount: Object.keys(genome.patterns || {}).length,
      entityCount: Object.keys(genome.entities || {}).length
    }
  };
}

/**
 * Get project status
 */
export async function getStatus(projectPath) {
  const palaceDir = path.join(projectPath, '.palace');
  const statePath = path.join(palaceDir, 'state', 'history.json');
  const genomePath = path.join(palaceDir, 'output', 'genome.json');
  
  const initialized = fs.existsSync(palaceDir);
  let status = {
    initialized,
    palaceDir,
    lastScan: null,
    genomeExists: false,
    fileCount: 0
  };
  
  if (initialized && fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    status.lastScan = state.created || state.updated;
    status.fileCount = state.files?.length || 0;
  }
  
  if (fs.existsSync(genomePath)) {
    status.genomeExists = true;
    const genome = JSON.parse(fs.readFileSync(genomePath, 'utf8'));
    status.genomeSize = genome.length;
  }
  
  return status;
}

/**
 * Generate reference URI
 */
export function generateRef(type, projectPath, data) {
  const hashInput = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = createHash('sha256')
    .update(hashInput)
    .digest('hex')
    .slice(0, 8);
  
  return `palace://${type}/${hash}`;
}

/**
 * Resolve reference to content
 */
export async function resolveRef(ref, depth = 1) {
  const match = ref.match(/^palace:\/\/(\w+)\/([a-f0-9]+)$/);
  if (!match) {
    throw new Error(`Invalid reference format: ${ref}`);
  }
  
  const [, type, hash] = match;
  
  // Reference resolution based on type
  switch (type) {
    case 'scan':
      return resolveScanRef(hash, depth);
    case 'genome':
      return resolveGenomeRef(hash, depth);
    case 'symbol':
      return resolveSymbolRef(hash, depth);
    case 'pattern':
      return resolvePatternRef(hash, depth);
    default:
      throw new Error(`Unknown reference type: ${type}`);
  }
}

async function resolveScanRef(hash, depth) {
  // Implementation would load from .palace/state
  return {
    ref: `palace://scan/${hash}`,
    depth,
    data: { summary: 'Scan data - implement full resolution' }
  };
}

async function resolveGenomeRef(hash, depth) {
  // Implementation would load from .palace/output/genome.json
  return {
    ref: `palace://genome/${hash}`,
    depth,
    data: { summary: 'Genome data - implement full resolution' }
  };
}

async function resolveSymbolRef(hash, depth) {
  return {
    ref: `palace://symbol/${hash}`,
    depth,
    data: { summary: 'Symbol data - implement full resolution' }
  };
}

async function resolvePatternRef(hash, depth) {
  return {
    ref: `palace://pattern/${hash}`,
    depth,
    data: { summary: 'Pattern data - implement full resolution' }
  };
}
