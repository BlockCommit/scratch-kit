/**
 * TurboWarp 扩展解析模块
 * 用于解析和分析 TurboWarp 扩展的元数据和积木信息
 */

export * from './types.js';
export { ExtensionParser, parseExtensionFromUrl, parseExtensionFromFile } from './parser.js';

import { ExtensionParser } from './parser.js';
import type { ExtensionMetadata, ParsedExtension, BlockDefinition } from './types.js';

/**
 * 创建扩展解析器
 */
export function createParser(sourceCode: string): ExtensionParser {
  return new ExtensionParser(sourceCode);
}

/**
 * 解析扩展字符串并返回完整信息
 */
export function parseExtension(sourceCode: string): ParsedExtension {
  const parser = new ExtensionParser(sourceCode);
  const metadata = parser.parse();

  return {
    metadata,
    scratchblocks: parser.generateScratchblocks(),
    typeDefinitions: parser.toTypeScript(),
    json: parser.toJSON(),
  };
}

/**
 * 从多个扩展生成积木映射
 */
export function generateBlockMap(extensions: ExtensionMetadata[]): Map<string, BlockDefinition> {
  const blockMap = new Map<string, BlockDefinition>();

  for (const ext of extensions) {
    for (const block of ext.blocks) {
      const fullOpcode = `${ext.id}_${block.opcode}`;
      blockMap.set(fullOpcode, block);
    }
  }

  return blockMap;
}

/**
 * 查找扩展中的积木
 */
export function findBlock(
  extensions: ExtensionMetadata[],
  opcode: string
): { extension: ExtensionMetadata; block: BlockDefinition } | undefined {
  for (const ext of extensions) {
    const block = ext.blocks.find(b => b.opcode === opcode);
    if (block) {
      return { extension: ext, block };
    }
  }
  return undefined;
}

/**
 * 验证扩展元数据
 */
export function validateExtension(metadata: ExtensionMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.id || metadata.id === 'unknown') {
    errors.push('Extension ID is missing or invalid');
  }

  if (!metadata.name || metadata.name === 'Unknown Extension') {
    errors.push('Extension name is missing or invalid');
  }

  if (!metadata.blocks || metadata.blocks.length === 0) {
    errors.push('Extension must have at least one block');
  }

  // 验证积木定义
  for (const block of metadata.blocks) {
    if (!block.opcode) {
      errors.push(`Block is missing opcode`);
    }

    if (!block.text) {
      errors.push(`Block ${block.opcode} is missing text`);
    }

    // 验证参数
    if (block.arguments) {
      Object.entries(block.arguments).forEach(([argName, arg]) => {
        if (!arg.type) {
          errors.push(`Argument ${argName} in block ${block.opcode} is missing type`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}