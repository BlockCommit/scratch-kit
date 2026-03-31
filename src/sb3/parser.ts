/**
 * SB3 项目解析器
 * 
 * 用于解析 Scratch 3.0 的 .sb3 文件（ZIP 格式），
 * 提取项目信息、角色数据和资源列表。
 * 
 * .sb3 文件结构：
 * - project.json: 项目数据和元数据
 * - [md5].svg/[md5].png: 造型和背景文件
 * - [md5].wav/[md5].mp3: 声音文件
 * 
 * 功能特性：
 * - 解析项目基本信息（名称、角色数、积木数等）
 * - 提取角色详细信息（积木、造型、声音、变量、列表）
 * - 提取资源文件信息（造型、背景、声音）
 * - 检测项目平台信息（Scratch、TurboWarp 等）
 * - 获取版本信息（Scratch 版本、VM 版本）
 * - 计算监控器数量
 * - 识别使用的扩展
 */

import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import type {
  SB3Project,
  SB3ProjectInfo,
  SpriteInfo,
  ResourceInfo,
  SB3ParseOptions
} from './types.js';

/**
 * SB3 项目解析器
 */
export class SB3Parser {
  private filePath: string;
  private options: SB3ParseOptions;
  private zip: AdmZip | null = null;

  /**
   * 构造函数
   * @param filePath - .sb3 文件的路径
   * @param options - 解析选项
   */
  constructor(filePath: string, options: SB3ParseOptions = {}) {
    this.filePath = filePath;
    this.options = {
      extractResources: false,
      includeStage: true,
      ...options
    };
  }

  /**
   * 解析 SB3 项目
   * 
   * @returns 完整的项目信息对象
   * @throws 如果文件无法打开或解析失败
   */
  async parse(): Promise<SB3Project> {
    // 初始化 ZIP 文件读取
    try {
      this.zip = new AdmZip(this.filePath);
    } catch (error) {
      throw new Error(`Failed to open SB3 file: ${error.message}`);
    }

    // 读取并解析 project.json
    const projectJson = await this.readProjectJson();
    
    // 提取各项信息
    const info = this.extractProjectInfo(projectJson);
    const sprites = this.extractSpriteInfo(projectJson);
    const resources = this.extractResourceInfo(projectJson, this.zip);

    return {
      info,
      sprites,
      resources
    };
  }

  /**
     * 读取 project.json 文件
     * 
     * @returns 解析后的 project.json 对象
     * @throws 如果文件不存在或 JSON 解析失败
     */
    private async readProjectJson(): Promise<any> {
      try {
        if (!this.zip) {
          throw new Error('ZIP file not initialized');
        }
  
        const projectJsonEntry = this.zip.getEntry('project.json');
        if (!projectJsonEntry) {
          throw new Error('project.json not found in SB3 file');
        }
  
        const content = projectJsonEntry.getData().toString('utf-8');
        return JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to read project.json: ${error.message}`);
      }
    }
  
  /**
     * 提取项目基本信息
     * 
     * 计算并提取以下信息：
     * - 项目名称
     * - 角色数量
     * - 积木总数（排除原型定义）
     * - 扩展列表
     * - 监控器数量
     * - 平台信息
     * - 版本信息
     * 
     * @param projectJson - project.json 对象
     * @returns 项目基本信息
     */
    private extractProjectInfo(projectJson: any): SB3ProjectInfo {    const targets = projectJson.targets || [];
    const extensions = projectJson.extensions || [];
    const meta = projectJson.meta || {};
    
    // 计算积木总数
    let totalBlocks = 0;
    let monitorCount = 0;
    
    for (const target of targets) {
      const blocks = target.blocks || {};
      
      for (const blockId in blocks) {
        const block = blocks[blockId];
        // 跳过原型定义
        if (block.parent !== null || block.topLevel) {
          totalBlocks++;
          // 检查是否为监控器
          if (block.opcode && block.opcode.startsWith('data_')) {
            // 这是一个变量/列表监控器
            if (block.shadow === false) {
              monitorCount++;
            }
          }
        }
      }
    }

    // 提取平台信息
    const platformInfo = meta.platform ? {
      name: meta.platform.name || 'Unknown',
      url: meta.platform.url
    } : undefined;

    return {
      name: meta.name || 'Untitled',
      spriteCount: targets.length,
      totalBlocks,
      extensions,
      monitorCount,
      platform: platformInfo,
      semver: meta.semver,
      vm: meta.vm
    };
  }

  /**
   * 提取角色信息
   * 
   * 遍历所有角色（包括舞台），提取：
   * - 角色名称和类型
   * - 积木数量
   * - 造型数量
   * - 声音数量
   * - 变量数量
   * - 列表数量
   * 
   * @param projectJson - project.json 对象
   * @returns 角色信息列表
   */
  private extractSpriteInfo(projectJson: any): SpriteInfo[] {
    const targets = projectJson.targets || [];
    const sprites: SpriteInfo[] = [];

    for (const target of targets) {
      const isStage = target.isStage || false;
      
      // 跳过舞台（如果不包含）
      if (!this.options.includeStage && isStage) {
        continue;
      }

      // 计算积木数量
      let blockCount = 0;
      const blocks = target.blocks || {};
      
      for (const blockId in blocks) {
        const block = blocks[blockId];
        if (block.parent !== null || block.topLevel) {
          blockCount++;
        }
      }

      // 统计变量和列表
      const variables = target.variables || {};
      const lists = target.lists || {};
      const variableCount = Object.keys(variables).length / 2; // 每个变量有 2 个条目
      const listCount = Object.keys(lists).length / 2; // 每个列表有 2 个条目

      sprites.push({
        name: target.name || 'Untitled',
        isStage,
        blockCount,
        costumeCount: (target.costumes || []).length,
        soundCount: (target.sounds || []).length,
        variableCount,
        listCount
      });
    }

    return sprites;
  }

  /**
   * 提取资源信息
   * 
   * 遍历所有角色，提取：
   * - 造型文件（舞台为背景）
   * - 声音文件
   * - 每个资源的文件名、格式和大小
   * 
   * @param projectJson - project.json 对象
   * @param zip - AdmZip 实例用于获取文件大小
   * @returns 资源信息列表
   */
  private extractResourceInfo(projectJson: any, zip: AdmZip): ResourceInfo[] {
    const targets = projectJson.targets || [];
    const resources: ResourceInfo[] = [];

    for (const target of targets) {
      const spriteName = target.name || 'Untitled';
      const isStage = target.isStage || false;

      // 处理造型/背景
      const costumes = target.costumes || [];
      for (const costume of costumes) {
        const assetId = costume.assetId || costume.md5ext || '';
        const format = this.getFormatFromAsset(assetId) || 'png';
        const filename = this.getAssetFilename(assetId);
        
        // 从 ZIP 中获取文件大小
        const size = this.getFileSize(zip, filename);
        
        resources.push({
          name: costume.name || 'Untitled',
          type: isStage ? 'backdrop' as any : 'costume' as any,
          spriteName,
          filename,
          format,
          size
        });
      }

      // 处理声音
      const sounds = target.sounds || [];
      for (const sound of sounds) {
        const assetId = sound.assetId || sound.md5ext || '';
        const format = this.getFormatFromAsset(assetId) || 'wav';
        const filename = this.getAssetFilename(assetId);
        
        // 从 ZIP 中获取文件大小
        const size = this.getFileSize(zip, filename);
        
        resources.push({
          name: sound.name || 'Untitled',
          type: 'sound' as any,
          spriteName,
          filename,
          format,
          size
        });
      }
    }

    return resources;
  }

  /**
   * 从 ZIP 中获取文件大小
   */
  private getFileSize(zip: AdmZip, filename: string): number {
    try {
      const entry = zip.getEntry(filename);
      return entry ? entry.header.size : 0;
    } catch {
      return 0;
    }
  }

  /**
   * 从资源 ID 中获取文件格式
   */
  private getFormatFromAsset(assetId: string): string | null {
    if (!assetId) return null;
    
    // 尝试从 md5ext 格式获取
    const parts = assetId.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    
    return null;
  }

  /**
   * 获取资源文件名
   */
  private getAssetFilename(assetId: string): string {
    if (!assetId) return '';
    
    // Scratch 使用 md5ext 格式
    if (assetId.includes('.')) {
      return assetId;
    }
    
    // 如果只有 md5，添加 .png 作为默认
    return `${assetId}.png`;
  }
}