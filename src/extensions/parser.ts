/**
 * TurboWarp 扩展解析器
 * 用于解析扩展的元数据、积木定义和参数信息
 */

import type { ExtensionMetadata, BlockDefinition, ArgumentDefinition, MenuDefinition, ExtensionBlockType, ExtensionArgumentType } from './types.js';

/**
 * 从扩展类源码中提取信息
 */
export class ExtensionParser {
  private sourceCode: string;
  private extensionMetadata: ExtensionMetadata | null = null;

  constructor(sourceCode: string) {
    this.sourceCode = sourceCode;
  }

  /**
   * 解析扩展，提取所有信息
   */
  parse(): ExtensionMetadata {
    const metadata: ExtensionMetadata = {
      id: this.extractId(),
      name: this.extractName(),
      color1: this.extractColor1(),
      color2: this.extractColor2(),
      color3: this.extractColor3(),
      menuIconURI: this.extractMenuIconURI(),
      blockIconURI: this.extractBlockIconURI(),
      docsURI: this.extractDocsURI(),
      blocks: this.extractBlocks(),
      menus: this.extractMenus(),
      unsandboxed: this.isUnsandboxed(),
      sourceCode: this.sourceCode,
    };

    this.extensionMetadata = metadata;
    return metadata;
  }

  /**
   * 提取扩展 ID
   */
  private extractId(): string {
    const match = this.sourceCode.match(/id:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : 'unknown';
  }

  /**
   * 提取扩展名称
   */
  private extractName(): string {
    const match = this.sourceCode.match(/name:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : 'Unknown Extension';
  }

  /**
   * 提取颜色值
   */
  private extractColor1(): string {
    const match = this.sourceCode.match(/color1:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : '#ff4c4c';
  }

  private extractColor2(): string {
    const match = this.sourceCode.match(/color2:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : '#d83e00';
  }

  private extractColor3(): string {
    const match = this.sourceCode.match(/color3:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : '#8f5700';
  }

  /**
   * 提取图标 URI
   */
  private extractMenuIconURI(): string | undefined {
    const match = this.sourceCode.match(/menuIconURI:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : undefined;
  }

  private extractBlockIconURI(): string | undefined {
    const match = this.sourceCode.match(/blockIconURI:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : undefined;
  }

  /**
   * 提取文档 URI
   */
  private extractDocsURI(): string | undefined {
    const match = this.sourceCode.match(/docsURI:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : undefined;
  }

  /**
   * 检查是否为非沙盒扩展
   */
  private isUnsandboxed(): boolean {
    return this.sourceCode.includes('Scratch.extensions.unsandboxed') ||
           this.sourceCode.includes('unsandboxed');
  }

  /**
   * 提取所有积木定义
   */
  private extractBlocks(): BlockDefinition[] {
    const blocks: BlockDefinition[] = [];

    // 查找 blocks 数组
    const blocksArrayMatch = this.sourceCode.match(/blocks:\s*\[([\s\S]*?)\],?\s*(menus|docsURI|color|blockIconURI|\})/);
    if (!blocksArrayMatch) return blocks;

    const blocksContent = blocksArrayMatch[1];

    // 提取每个积木对象
    const blockObjects = this.extractObjects(blocksContent);

    for (const blockObj of blockObjects) {
      try {
        const block = this.parseBlock(blockObj);
        if (block) {
          blocks.push(block);
        }
      } catch (error) {
        console.warn(`无法解析积木: ${error.message}`);
      }
    }

    return blocks;
  }

  /**
   * 解析单个积木
   */
  private parseBlock(blockObj: string): BlockDefinition | null {
    // 跳过分隔符
    if (blockObj.trim() === '---') {
      return null;
    }

    const block: BlockDefinition = {
      opcode: this.extractProperty(blockObj, 'opcode'),
      blockType: this.extractBlockType(blockObj),
      text: this.extractText(blockObj),
      arguments: this.extractArguments(blockObj),
      isEdgeActivated: this.extractBooleanProperty(blockObj, 'isEdgeActivated', false),
      shouldRestartExistingThreads: this.extractBooleanProperty(blockObj, 'shouldRestartExistingThreads', false),
      disableMonitor: this.extractBooleanProperty(blockObj, 'disableMonitor', false),
      hideFromPalette: this.extractBooleanProperty(blockObj, 'hideFromPalette', false),
      filter: this.extractFilter(blockObj),
      isTerminal: this.extractBooleanProperty(blockObj, 'isTerminal', false),
      blockIconURI: this.extractProperty(blockObj, 'blockIconURI'),
    };

    return block;
  }

  /**
   * 提取积木类型
   */
  private extractBlockType(blockObj: string): ExtensionBlockType {
    const match = blockObj.match(/blockType:\s*Scratch\.BlockType\.(\w+)/);
    return (match ? match[1] : 'COMMAND') as ExtensionBlockType;
  }

  /**
   * 提取积木文本
   */
  private extractText(blockObj: string): string {
    const match = blockObj.match(/text:\s*['\"`]([^'\"`]+)['\"`]/);
    return match ? match[1] : '';
  }

  /**
   * 提取参数定义
   */
  private extractArguments(blockObj: string): Record<string, ArgumentDefinition> {
    const argumentsMatch = blockObj.match(/arguments:\s*\{([\s\S]*?)\}/);
    if (!argumentsMatch) return {};

    const args: Record<string, ArgumentDefinition> = {};
    const argsContent = argumentsMatch[1];

    // 手动提取参数名和参数内容
    const lines = argsContent.split('\n');
    let currentIndent = null;
    let currentParamName = null;
    let paramContent = '';
    let braceDepth = 0;
    let inParam = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 计算缩进
      const indent = line.search(/\S/);

      // 检查是否是参数名行（缩进最少的行，且以参数名: { 开始）
      const paramNameMatch = line.match(/^(\s*)(\w+):\s*\{?/);
      if (paramNameMatch && (currentIndent === null || indent <= currentIndent)) {
        // 保存前一个参数
        if (currentParamName && paramContent) {
          try {
            const fullParamContent = '{' + paramContent.trim() + '}';
            args[currentParamName] = this.parseArgument(fullParamContent);
          } catch (error) {
            console.warn(`无法解析参数 ${currentParamName}: ${error.message}`);
          }
        }

        // 开始新参数
        currentIndent = indent;
        currentParamName = paramNameMatch[2];
        paramContent = '';
        braceDepth = 0;
        inParam = true;

        // 处理当前行的内容
        if (line.includes('{')) {
          const contentAfterBrace = line.substring(line.indexOf('{') + 1);
          const openBraces = (contentAfterBrace.match(/\{/g) || []).length;
          const closeBraces = (contentAfterBrace.match(/\}/g) || []).length;
          braceDepth = openBraces - closeBraces;

          if (braceDepth <= 0 && closeBraces > 0) {
            // 当行完成
            const lastBraceIndex = contentAfterBrace.lastIndexOf('}');
            paramContent = contentAfterBrace.substring(0, lastBraceIndex);
            inParam = false;
          } else {
            paramContent = contentAfterBrace + '\n';
          }
        }
      } else if (inParam) {
        paramContent += line + '\n';
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceDepth += openBraces - closeBraces;

        if (braceDepth <= 0 && closeBraces > 0) {
          // 找到闭合大括号
          const lastBraceIndex = line.lastIndexOf('}');
          paramContent = paramContent.substring(0, paramContent.lastIndexOf('}'));
          inParam = false;
        }
      }
    }

    // 处理最后一个参数
    if (currentParamName && paramContent) {
      try {
        const fullParamContent = '{' + paramContent.trim() + '}';
        args[currentParamName] = this.parseArgument(fullParamContent);
      } catch (error) {
        console.warn(`无法解析参数 ${currentParamName}: ${error.message}`);
      }
    }

    return args;
  }

  /**
   * 解析单个参数
   */
  private parseArgument(paramContent: string): ArgumentDefinition {
    const arg: ArgumentDefinition = {
      type: this.extractArgumentType(paramContent),
      defaultValue: this.extractProperty(paramContent, 'defaultValue'),
      menu: this.extractProperty(paramContent, 'menu'),
      dataURI: this.extractProperty(paramContent, 'dataURI'),
      flipRTL: this.extractBooleanProperty(paramContent, 'flipRTL', false),
    };

    return arg;
  }

  /**
   * 提取参数类型
   */
  private extractArgumentType(content: string): ExtensionArgumentType {
    const match = content.match(/type:\s*Scratch\.ArgumentType\.(\w+)/);
    return (match ? match[1] : 'STRING') as ExtensionArgumentType;
  }

  /**
   * 提取过滤器
   */
  private extractFilter(blockObj: string): string[] | undefined {
    const filterMatch = blockObj.match(/filter:\s*\[([\s\S]*?)\]/);
    if (!filterMatch) return undefined;

    const filters: string[] = [];
    const filterContent = filterMatch[1];

    // 提取过滤器类型
    const filterMatches = filterContent.matchAll(/Scratch\.TargetType\.(\w+)/g);
    for (const match of filterMatches) {
      filters.push(match[1]);
    }

    return filters.length > 0 ? filters : undefined;
  }

  /**
   * 提取所有菜单定义
   */
  private extractMenus(): Record<string, MenuDefinition> {
    const menus: Record<string, MenuDefinition> = {};

    // 查找 menus 对象（使用更宽松的正则表达式）
    const menusMatch = this.sourceCode.match(/menus:\s*\{([\s\S]*?)\},?\s*(?:color1|blockIconURI|menuIconURI|docsURI|\}|\))/);
    if (!menusMatch) return menus;

    const menusContent = menusMatch[1];

    // 提取每个菜单
    const menuMatches = menusContent.matchAll(/(\w+):\s*\{([^}]+)\}/g);
    for (const match of menuMatches) {
      const menuName = match[1];
      const menuContent = match[2];

      menus[menuName] = this.parseMenu(menuContent);
    }

    return menus;
  }

  /**
   * 解析单个菜单
   */
  private parseMenu(menuContent: string): MenuDefinition {
    const menu: MenuDefinition = {
      acceptReporters: this.extractBooleanProperty(menuContent, 'acceptReporters', true),
      items: this.extractMenuItems(menuContent),
    };

    return menu;
  }

  /**
   * 提取菜单项
   */
  private extractMenuItems(menuContent: string): Array<string | { text: string; value: string }> {
    const itemsMatch = menuContent.match(/items:\s*\[([\s\S]*?)\]/);
    if (!itemsMatch) return [];

    const items: Array<string | { text: string; value: string }> = [];
    const itemsContent = itemsMatch[1];

    // 先尝试匹配对象形式的菜单项
    const objectPattern = /\{[^{}]*\}/g;
    let match;
    while ((match = objectPattern.exec(itemsContent)) !== null) {
      const objText = match[0];
      const textMatch = objText.match(/text:\s*['"]([^'"]+)['"]/);
      const valueMatch = objText.match(/value:\s*['"]([^'"]+)['"]/);
      if (textMatch && valueMatch) {
        items.push({ text: textMatch[1], value: valueMatch[1] });
      }
    }

    // 然后尝试匹配字符串形式的菜单项（排除对象中的字符串）
    const stringPattern = /['"]([^'"]+)['"]/g;
    // 重置正则表达式的 lastIndex
    objectPattern.lastIndex = 0;
    while ((match = stringPattern.exec(itemsContent)) !== null) {
      const fullMatch = match[0];
      // 检查这个字符串是否在对象内
      const startIndex = match.index;
      let inObject = false;
      for (const objMatch of itemsContent.matchAll(/\{[^{}]*\}/g)) {
        if (startIndex >= objMatch.index && startIndex < objMatch.index + objMatch[0].length) {
          inObject = true;
          break;
        }
      }
      if (!inObject) {
        items.push(match[1]);
      }
    }

    return items;
  }

  /**
   * 通用属性提取
   */
  private extractProperty(content: string, propName: string): string | undefined {
    // 尝试双引号
    const doubleQuoteMatch = content.match(new RegExp(`${propName}:\\s*"([^"]+)"`));
    if (doubleQuoteMatch) return doubleQuoteMatch[1];

    // 尝试单引号
    const singleQuoteMatch = content.match(new RegExp(`${propName}:\\s*'([^']+)'`));
    if (singleQuoteMatch) return singleQuoteMatch[1];

    // 尝试反引号
    const backtickMatch = content.match(new RegExp(`${propName}:\\s*\`([^\`]+)\``));
    if (backtickMatch) return backtickMatch[1];

    return undefined;
  }

  /**
   * 提取布尔属性
   */
  private extractBooleanProperty(content: string, propName: string, defaultValue: boolean): boolean {
    const match = content.match(new RegExp(`${propName}:\\s*(true|false)`));
    return match ? match[1] === 'true' : defaultValue;
  }

  /**
   * 从字符串中提取所有对象
   */
  private extractObjects(str: string): string[] {
    const objects: string[] = [];
    let depth = 0;
    let currentObj = '';
    let inString = false;
    let stringChar = '';
    let i = 0;

    while (i < str.length) {
      const char = str[i];

      if (inString) {
        currentObj += char;
        if (char === stringChar && str[i - 1] !== '\\') {
          inString = false;
        }
        i++;
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
        currentObj += char;
        i++;
        continue;
      }

      if (char === '{') {
        depth++;
        currentObj += char;
      } else if (char === '}') {
        depth--;
        currentObj += char;
        if (depth === 0) {
          objects.push(currentObj.trim());
          currentObj = '';
        }
      } else if (depth > 0) {
        currentObj += char;
      }

      i++;
    }

    return objects;
  }

  /**
   * 生成积木的 scratchblocks 格式文本
   */
  generateScratchblocks(blocks?: BlockDefinition[]): string[] {
    const blocksToProcess = blocks || this.extensionMetadata?.blocks || [];
    const results: string[] = [];

    for (const block of blocksToProcess) {
      if (!block.text) continue;

      let text = block.text;

      // 替换参数占位符
      if (block.arguments) {
        Object.keys(block.arguments).forEach(argName => {
          const arg = block.arguments[argName];
          let placeholder = this.getPlaceholderForArgType(arg.type);

          // 如果有菜单，使用菜单占位符
          if (arg.menu && this.extensionMetadata?.menus?.[arg.menu]) {
            placeholder = `[${arg.menu} v]`;
          }

          text = text.replace(new RegExp(`\\{${argName}\\}`, 'g'), placeholder);
        });
      }

      // 根据积木类型添加前缀/后缀
      switch (block.blockType) {
        case 'COMMAND':
          // 普通命令块，不需要特殊处理
          break;
        case 'REPORTER':
          text = `(${text})`;
          break;
        case 'BOOLEAN':
          text = `<${text}>`;
          break;
        case 'HAT':
        case 'EVENT':
          text = `when ${text}`;
          break;
      }

      results.push(text);
    }

    return results;
  }

  /**
   * 根据参数类型获取占位符
   */
  private getPlaceholderForArgType(type: string): string {
    switch (type) {
      case 'STRING':
        return '[text]';
      case 'NUMBER':
        return '[number]';
      case 'BOOLEAN':
        return '<condition>';
      case 'COLOR':
        return '[color]';
      case 'ANGLE':
        return '[direction]';
      case 'MATRIX':
        return '[matrix]';
      case 'NOTE':
        return '[note]';
      case 'IMAGE':
        return '[image]';
      case 'COSTUME':
        return '[costume v]';
      case 'SOUND':
        return '[sound v]';
      default:
        return '[input]';
    }
  }

  /**
   * 导出为 JSON
   */
  toJSON(): string {
    return JSON.stringify(this.extensionMetadata, null, 2);
  }

  /**
   * 导出为 TypeScript 类型定义
   */
  toTypeScript(): string {
    const meta = this.extensionMetadata;
    if (!meta) return '';

    let output = `// Extension: ${meta.name}\n`;
    output += `// ID: ${meta.id}\n\n`;

    // 生成积木类型定义
    output += `interface ${meta.id}Blocks {\n`;
    for (const block of meta.blocks) {
      const signature = this.generateBlockSignature(block);
      output += `  ${block.opcode}: ${signature};\n`;
    }
    output += `}\n`;

    return output;
  }

  /**
   * 生成积木函数签名
   */
  private generateBlockSignature(block: BlockDefinition): string {
    let signature = '';

    // 构建参数列表
    if (block.arguments && Object.keys(block.arguments).length > 0) {
      const params = Object.entries(block.arguments).map(([name, arg]) => {
        const tsType = this.getTsTypeForArgType(arg.type);
        return `${name}: ${tsType}`;
      });
      signature += `(${params.join(', ')})`;
    } else {
      signature += '()';
    }

    // 返回类型
    switch (block.blockType) {
      case 'REPORTER':
        signature += ': string | number';
        break;
      case 'BOOLEAN':
        signature += ': boolean';
        break;
      default:
        signature += ': void';
    }

    return signature;
  }

  /**
   * 获取参数的 TypeScript 类型
   */
  private getTsTypeForArgType(type: string): string {
    switch (type) {
      case 'STRING':
        return 'string';
      case 'NUMBER':
        return 'number';
      case 'BOOLEAN':
        return 'boolean';
      case 'COLOR':
        return 'string';
      case 'ANGLE':
        return 'number';
      case 'MATRIX':
        return 'string';
      case 'NOTE':
        return 'number';
      case 'IMAGE':
        return 'string';
      case 'COSTUME':
        return 'string';
      case 'SOUND':
        return 'string';
      default:
        return 'any';
    }
  }
}

/**
 * 从 URL 加载扩展并解析
 */
export async function parseExtensionFromUrl(url: string): Promise<ExtensionMetadata> {
  const response = await fetch(url);
  const sourceCode = await response.text();

  const parser = new ExtensionParser(sourceCode);
  return parser.parse();
}

/**
 * 从文件路径加载扩展并解析
 */
export async function parseExtensionFromFile(filePath: string): Promise<ExtensionMetadata> {
  const fs = await import('fs/promises');
  const sourceCode = await fs.readFile(filePath, 'utf-8');

  const parser = new ExtensionParser(sourceCode);
  return parser.parse();
}