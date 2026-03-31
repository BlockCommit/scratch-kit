/**
 * TurboWarp 扩展类型定义
 */

/** 翻译数据类型 */
export type TranslationData = Record<string, Record<string, string>>;

export interface ExtensionMetadata {
  /** 扩展 ID */
  id: string;
  /** 扩展名称 */
  name: string;
  /** 主颜色 */
  color1: string;
  /** 次颜色 */
  color2: string;
  /** 第三颜色 */
  color3: string;
  /** 菜单图标 URI */
  menuIconURI?: string;
  /** 积木图标 URI */
  blockIconURI?: string;
  /** 文档 URI */
  docsURI?: string;
  /** 积木定义列表 */
  blocks: BlockDefinition[];
  /** 菜单定义 */
  menus: Record<string, MenuDefinition>;
  /** 是否为非沙盒扩展 */
  unsandboxed: boolean;
  /** 原始源代码 */
  sourceCode: string;
  /** 国际化翻译数据 */
  translations?: TranslationData;
}

export interface BlockDefinition {
  /** 积木操作码 */
  opcode: string;
  /** 积木类型 */
  blockType: ExtensionBlockType;
  /** 积木文本 (可能是函数调用，用于国际化) */
  text: string;
  /** 翻译键 (如果有) */
  translationKey?: string;
  /** 参数定义 */
  arguments: Record<string, ArgumentDefinition>;
  /** 是否边缘激活 (用于 hat blocks) */
  isEdgeActivated: boolean;
  /** 是否重启现有线程 */
  shouldRestartExistingThreads: boolean;
  /** 是否禁用监视器 */
  disableMonitor: boolean;
  /** 是否从面板隐藏 */
  hideFromPalette: boolean;
  /** 过滤器 (舞台/精灵) */
  filter?: string[];
  /** 是否为终端块 */
  isTerminal: boolean;
  /** 块图标 URI */
  blockIconURI?: string;
}

export enum ExtensionBlockType {
  /** 命令块 */
  COMMAND = 'COMMAND',
  /** 报告器块 */
  REPORTER = 'REPORTER',
  /** 布尔块 */
  BOOLEAN = 'BOOLEAN',
  /** Hat 块 */
  HAT = 'HAT',
  /** 事件块 */
  EVENT = 'EVENT',
}

export interface ArgumentDefinition {
  /** 参数类型 */
  type: ExtensionArgumentType;
  /** 默认值 */
  defaultValue?: string;
  /** 菜单名称 */
  menu?: string;
  /** 图像数据 URI */
  dataURI?: string;
  /** 是否在 RTL 语言中翻转 */
  flipRTL: boolean;
}

export enum ExtensionArgumentType {
  /** 字符串 */
  STRING = 'STRING',
  /** 数字 */
  NUMBER = 'NUMBER',
  /** 布尔 */
  BOOLEAN = 'BOOLEAN',
  /** 颜色 */
  COLOR = 'COLOR',
  /** 角度 */
  ANGLE = 'ANGLE',
  /** 矩阵 */
  MATRIX = 'MATRIX',
  /** 音符 */
  NOTE = 'NOTE',
  /** 图像 */
  IMAGE = 'IMAGE',
  /** 造型 */
  COSTUME = 'COSTUME',
  /** 声音 */
  SOUND = 'SOUND',
}

export interface MenuDefinition {
  /** 是否接受报告器 */
  acceptReporters: boolean;
  /** 菜单项 */
  items: Array<string | { text: string; value: string }>;
}

export interface ParsedExtension {
  /** 扩展元数据 */
  metadata: ExtensionMetadata;
  /** Scratchblocks 格式的积木文本 */
  scratchblocks: string[];
  /** TypeScript 类型定义 */
  typeDefinitions: string;
  /** JSON 导出 */
  json: string;
}