/**
 * SB3 项目类型定义
 * 
 * 定义 Scratch 3.0 .sb3 文件解析相关的数据结构。
 * 包括项目信息、角色信息、资源信息等。
 */

/**
 * 平台信息
 * 
 * 记录项目的创建平台信息（如 Scratch、TurboWarp 等）
 */
export interface PlatformInfo {
  /** 平台名称 */
  name: string;
  /** 平台 URL */
  url?: string;
}

/**
 * SB3 项目基本信息
 * 
 * 包含项目的统计信息和元数据
 * 注意：extensions 列表只包含包含 JS 代码的自定义扩展，
 * 不包含 Scratch/TurboWarp 自带的扩展。
 */
export interface SB3ProjectInfo {
  /** 项目名称 */
  name: string;
  /** 角色数量（包括舞台） */
  spriteCount: number;
  /** 积木总数（排除原型定义） */
  totalBlocks: number;
  /** 自定义扩展列表（仅包含包含 JS 代码的扩展，不含 Scratch/TurboWarp 自带扩展） */
  extensions: string[];
  /** 监控器数量（变量/列表监控器） */
  monitorCount: number;
  /** 平台信息 */
  platform?: PlatformInfo;
  /** Scratch 版本（如 3.0.0） */
  semver?: string;
  /** VM 版本（如 0.2.0） */
  vm?: string;
}

/**
 * 角色信息
 * 
 * 单个角色或舞台的详细信息
 */
export interface SpriteInfo {
  /** 角色名称 */
  name: string;
  /** 是否为舞台 */
  isStage: boolean;
  /** 积木数量 */
  blockCount: number;
  /** 造型数量（舞台为背景） */
  costumeCount: number;
  /** 声音数量 */
  soundCount: number;
  /** 变量数量 */
  variableCount: number;
  /** 列表数量 */
  listCount: number;
}

/**
 * 资源类型
 * 
 * 定义 Scratch 项目中资源的类型
 */
export enum ResourceType {
  /** 造型 */
  COSTUME = 'costume',
  /** 声音 */
  SOUND = 'sound',
  /** 背景（舞台的造型） */
  BACKDROP = 'backdrop'
}

/**
 * 资源信息
 * 
 * 单个资源文件的详细信息
 */
export interface ResourceInfo {
  /** 资源名称 */
  name: string;
  /** 资源类型 */
  type: ResourceType;
  /** 所属角色名称 */
  spriteName: string;
  /** 文件名（在 ZIP 中的路径） */
  filename: string;
  /** 数据格式（如 png, svg, wav, mp3 等） */
  format: string;
  /** 文件大小（字节） */
  size: number;
}

/**
 * SB3 项目完整信息
 * 
 * 包含项目的所有解析结果
 */
export interface SB3Project {
  /** 基本信息 */
  info: SB3ProjectInfo;
  /** 角色列表 */
  sprites: SpriteInfo[];
  /** 资源列表 */
  resources: ResourceInfo[];
}

/**
 * 解析选项
 * 
 * 控制 SB3 文件解析的行为
 */
export interface SB3ParseOptions {
  /** 是否提取资源文件内容（暂未实现） */
  extractResources?: boolean;
  /** 是否在角色列表中包含舞台 */
  includeStage?: boolean;
}