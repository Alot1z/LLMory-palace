/**
 * Reference System for Palace MCP Server
 * 
 * Generates and resolves palace:// URIs with minimal token overhead
 * 
 * Depth levels:
 * - depth=1: Summary only (meta + count) - ~50 tokens
 * - depth=2: Outline (names + signatures) - ~200 tokens
 * - depth=3: Full content - variable
 */

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

const REFERENCE_FILE = 'references.json';

/**
 * Generate a reference for content
 */
export function generateRef(type, content, projectPath = null) {
  const hashInput = typeof content === 'string' ? content : JSON.stringify(content);
  const hash = createHash('sha256')
    .update(hashInput)
    .digest('hex')
    .slice(0, 8);
  
  return `palace://${type}/${hash}`;
}

/**
 * Store reference mapping
 */
export function storeRef(projectPath, ref, data, meta = {}) {
  const refPath = path.join(projectPath, '.palace', REFERENCE_FILE);
  
  let refs = {};
  if (fs.existsSync(refPath)) {
    refs = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  }
  
  refs[ref] = {
    created: new Date().toISOString(),
    meta,
    dataPath: `${ref.replace('palace://', '')}.json`
  };
  
  fs.mkdirSync(path.dirname(refPath), { recursive: true });
  fs.writeFileSync(refPath, JSON.stringify(refs, null, 2));
  
  // Store data separately
  const dataPath = path.join(projectPath, '.palace', 'refs', refs[ref].dataPath);
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  
  return ref;
}

/**
 * Resolve reference to content at specified depth
 */
export async function resolveRef(projectPath, ref, depth = 1) {
  const refPath = path.join(projectPath, '.palace', REFERENCE_FILE);
  
  if (!fs.existsSync(refPath)) {
    throw new Error(`Reference registry not found. Run scan first.`);
  }
  
  const refs = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  const refEntry = refs[ref];
  
  if (!refEntry) {
    throw new Error(`Reference not found: ${ref}`);
  }
  
  const dataPath = path.join(projectPath, '.palace', 'refs', refEntry.dataPath);
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Reference data not found: ${ref}`);
  }
  
  const fullData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Return based on depth
  switch (depth) {
    case 1:
      return formatSummary(ref, refEntry.meta, fullData);
    case 2:
      return formatOutline(ref, refEntry.meta, fullData);
    case 3:
      return formatFull(ref, refEntry.meta, fullData);
    default:
      return formatSummary(ref, refEntry.meta, fullData);
  }
}

/**
 * Format summary (depth=1) - ~50 tokens
 */
function formatSummary(ref, meta, data) {
  return {
    ref,
    depth: 1,
    meta: {
      type: meta.type || 'unknown',
      count: meta.count || Object.keys(data).length,
      created: meta.created,
      stale: checkStale(meta)
    },
    summary: extractSummary(data)
  };
}

/**
 * Format outline (depth=2) - ~200 tokens
 */
function formatOutline(ref, meta, data) {
  const summary = formatSummary(ref, meta, data);
  
  return {
    ...summary,
    depth: 2,
    outline: extractOutline(data),
    needsFullContent: false
  };
}

/**
 * Format full content (depth=3)
 */
function formatFull(ref, meta, data) {
  const outline = formatOutline(ref, meta, data);
  
  return {
    ...outline,
    depth: 3,
    content: data,
    needsFullContent: false
  };
}

/**
 * Extract summary from data
 */
function extractSummary(data) {
  if (Array.isArray(data)) {
    return `${data.length} items`;
  }
  
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    return `${keys.length} ${keys.length === 1 ? 'entry' : 'entries'}`;
  }
  
  return 'data available';
}

/**
 * Extract outline from data
 */
function extractOutline(data) {
  if (Array.isArray(data)) {
    return data.slice(0, 20).map(item => {
      if (typeof item === 'object') {
        return item.name || item.id || item.type || 'item';
      }
      return String(item).slice(0, 50);
    });
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).slice(0, 20);
  }
  
  return null;
}

/**
 * Check if reference is stale
 */
function checkStale(meta) {
  if (!meta.filePaths || meta.filePaths.length === 0) {
    return false;
  }
  
  const refMtime = new Date(meta.created).getTime();
  
  for (const filePath of meta.filePaths) {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs > refMtime) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Create scan reference
 */
export function createScanRef(projectPath, scanResult) {
  const ref = generateRef('scan', scanResult);
  
  const meta = {
    type: 'scan',
    count: scanResult.files?.length || 0,
    patterns: scanResult.patterns?.length || 0,
    flows: scanResult.flows?.length || 0,
    created: new Date().toISOString()
  };
  
  storeRef(projectPath, ref, scanResult, meta);
  
  return { ref, meta };
}

/**
 * Create genome reference
 */
export function createGenomeRef(projectPath, genome) {
  const ref = generateRef('genome', genome);
  
  const meta = {
    type: 'genome',
    count: Object.keys(genome.patterns || {}).length,
    entities: Object.keys(genome.entities || {}).length,
    size: JSON.stringify(genome).length,
    created: new Date().toISOString()
  };
  
  storeRef(projectPath, ref, genome, meta);
  
  return { ref, meta };
}

/**
 * Create symbol reference
 */
export function createSymbolRef(projectPath, symbol) {
  const ref = generateRef('symbol', symbol);
  
  const meta = {
    type: 'symbol',
    name: symbol.name,
    kind: symbol.kind,
    file: symbol.file,
    created: new Date().toISOString(),
    filePaths: [symbol.file]
  };
  
  storeRef(projectPath, ref, symbol, meta);
  
  return { ref, meta };
}

/**
 * Create pattern reference
 */
export function createPatternRef(projectPath, pattern) {
  const ref = generateRef('pattern', pattern);
  
  const meta = {
    type: 'pattern',
    name: pattern.name,
    occurrences: pattern.occurrences?.length || 0,
    created: new Date().toISOString()
  };
  
  storeRef(projectPath, ref, pattern, meta);
  
  return { ref, meta };
}
