/**
 * SB3 项目类型定义
 */

/** 平台信息 */
export interface PlatformInfo {
  /** 平台名称 */
  name: string;
  /** 平台 URL */
  url?: string;
}

/** SB3 项目基本信息 */
export interface SB3ProjectInfo {
  /** 项目名称 */
  name: string;
  /** 角色数量（包括舞台） */
  spriteCount: number;
  /** 积木总数 */
  totalBlocks: number;
  /** 扩展列表 */
  extensions: string[];
  /** 监控器数量 */
  monitorCount: number;
  /** 平台信息 */
  platform?: PlatformInfo;
  /** Scratch 版本 */
  semver?: string;
  /** VM 版本 */
  vm?: string;
}

/** 角色信息 */
export interface SpriteInfo {
  /** 角色名称 */
  name: string;
  /** 是否为舞台 */
  isStage: boolean;
  /** 积木数量 */
  blockCount: number;
  /** 造型数量 */
  costumeCount: number;
  /** 声音数量 */
  soundCount: number;
  /** 变量数量 */
  variableCount: number;
  /** 列表数量 */
  listCount: number;
}

/** 资源类型 */
export enum ResourceType {
  COSTUME = 'costume',
  SOUND = 'sound',
  BACKDROP = 'backdrop'
}

/** 资源信息 */
export interface ResourceInfo {
  /** 资源名称 */
  name: string;
  /** 资源类型 */
  type: ResourceType;
  /** 所属角色 */
  spriteName: string;
  /** 文件名（在 ZIP 中） */
  filename: string;
  /** 数据格式（如 png, svg, wav 等） */
  format: string;
  /** 文件大小（字节） */
  size: number;
}

/** SB3 项目完整信息 */
export interface SB3Project {
  /** 基本信息 */
  info: SB3ProjectInfo;
  /** 角色列表 */
  sprites: SpriteInfo[];
  /** 资源列表 */
  resources: ResourceInfo[];
}

/** 解析选项 */
export interface SB3ParseOptions {
  /** 是否提取资源文件内容 */
  extractResources?: boolean;
  /** 是否包含舞台在角色列表中 */
  includeStage?: boolean;
}