/**
 * scratch-kit - A full-featured tool for processing Scratch projects
 *
 * Copyright (c) 2026 BlockCommit
 */

export * from './parser.js';
export * from './transformer.js';
export * from './utils.js';
export * from './scratchblocks/parser.js';
export * from './scratchblocks/types.js';
export * from './scratchblocks/blocks.js';
export * from './scratchblocks/input.js';
export * from './scratchblocks/block-mapping.js';
export * from './extensions/index.js';
export { ExtensionParser, parseExtensionFromUrl, parseExtensionFromFile } from './extensions/parser.js';