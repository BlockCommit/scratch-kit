/**
 * Scratchblocks 块类型定义
 */

export interface BlockInfo {
  noTranslation?: boolean;
  defaultMessage: string;
  type: BlockType;
  defaultOptions?: Record<string, string>;
  translationKey: string;
  boolArg?: string[];
  remap?: Record<string, string>;
}

export enum BlockType {
  BLOCK = 'BLOCK',
  BOOLEAN_BLOCK = 'BOOLEAN_BLOCK',
  C_BLOCK = 'C_BLOCK',
  E_BLOCK = 'E_BLOCK',
  REPORTER_BLOCK = 'REPORTER_BLOCK',
  HAT = 'HAT',
  CAP = 'CAP',
}

export interface LocaleData {
  [key: string]: string | LocaleData;
}

export interface BlockOptions {
  tab?: string;
  variableStyle?: 'none' | 'always' | 'as-needed';
  _stackNum?: number;
}

export interface Inputtables {
  [key: string]: Inputtable;
}

export interface Inputtable {
  toScratchblocks(locale: string, opts: BlockOptions): string;
}

export interface Connectable {
  id?: string | null;
  opcode?: string;
  inputtables: Inputtables;
  toScratchblocks(locale: string, opts: BlockOptions, ...args: any[]): string;
}