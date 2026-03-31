/**
 * Transformer utilities for Scratch projects
 */

import type { ScratchProject } from './parser.js';

export interface TransformOptions {
  preserveIds?: boolean;
  normalizeBlocks?: boolean;
  removeUnused?: boolean;
}

export function transformProject(
  project: ScratchProject,
  options: TransformOptions = {}
): ScratchProject {
  const result = JSON.parse(JSON.stringify(project));
  
  if (options.normalizeBlocks) {
    // Normalize block structure
    result.targets = result.targets.map((target: any) => {
      if (target.blocks) {
        target.blocks = normalizeBlocks(target.blocks);
      }
      return target;
    });
  }
  
  if (options.removeUnused) {
    // Remove unused assets
    result.targets = result.targets.filter((target: any) => {
      return !target.isStage || Object.keys(target.blocks || {}).length > 0;
    });
  }
  
  return result;
}

function normalizeBlocks(blocks: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [id, block] of Object.entries(blocks)) {
    normalized[id] = {
      ...block,
      opcode: block.opcode || '',
      next: block.next || null,
      parent: block.parent || null,
      inputs: block.inputs || {},
      fields: block.fields || {},
      shadow: block.shadow || false,
      topLevel: block.topLevel || false,
      x: block.x || 0,
      y: block.y || 0
    };
  }
  
  return normalized;
}