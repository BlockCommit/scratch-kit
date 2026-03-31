/**
 * TurboWarp 扩展解析器
 * 
 * 使用 Babel AST 解析 TurboWarp 扩展的 JavaScript 源代码，
 * 提取扩展的元数据、积木定义、参数信息和翻译数据。
 * 
 * 相比正则表达式解析，AST 解析更加准确和健壮，
 * 能够正确处理复杂的嵌套结构和函数调用。
 * 
 * 功能特性：
 * - 解析扩展元数据（ID、名称、颜色等）
 * - 提取积木定义（命令、报告器、布尔、Hat 块）
 * - 解析参数类型和默认值
 * - 提取菜单定义和选项
 * - 支持国际化翻译（Scratch.translate）
 * - 生成符合 scratchblocks 规范的文本
 */

import { parse } from '@babel/parser';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ExtensionMetadata, BlockDefinition, ArgumentDefinition, MenuDefinition, ExtensionBlockType, ExtensionArgumentType } from './types.js';

// 处理 @babel/traverse 的默认导出问题
const traverseFunc = (traverse as any).default || traverse;

export class ExtensionParser {
  private sourceCode: string;
  private extensionMetadata: ExtensionMetadata | null = null;

  /**
   * 构造函数
   * @param sourceCode - TurboWarp 扩展的 JavaScript 源代码
   */
  constructor(sourceCode: string) {
    this.sourceCode = sourceCode;
  }

  /**
   * 解析扩展，提取所有信息
   * 
   * @returns 扩展元数据对象
   */
  parse(): ExtensionMetadata {
    // 将源代码解析为 AST
    const ast = parse(this.sourceCode, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    // 构建元数据对象
    const metadata: ExtensionMetadata = {
      id: this.extractId(ast),
      name: this.extractName(ast),
      color1: this.extractColor1(ast),
      color2: this.extractColor2(ast),
      color3: this.extractColor3(ast),
      menuIconURI: this.extractMenuIconURI(ast),
      blockIconURI: this.extractBlockIconURI(ast),
      docsURI: this.extractDocsURI(ast),
      blocks: this.extractBlocks(ast),
      menus: this.extractMenus(ast),
      unsandboxed: this.isUnsandboxed(),
      sourceCode: this.sourceCode,
      translations: this.extractTranslations(ast),
    };

    this.extensionMetadata = metadata;
    return metadata;
  }

  /**
   * 查找 getInfo() 方法的返回值
   * 
   * getInfo() 方法返回一个对象，包含扩展的所有元数据。
   * 此方法在 AST 中遍历查找 ClassMethod 类型的 getInfo 方法，
   * 并提取其 return 语句的参数（即返回的对象表达式）。
   * 
   * @param ast - AST 根节点
   * @returns getInfo() 方法返回的对象表达式，如果未找到则返回 null
   */
  private findGetInfoReturn(ast: t.File): t.ObjectExpression | null {
    let getInfoReturn: t.ObjectExpression | null = null;

    traverseFunc(ast, {
      ClassMethod(path) {
        // 检查是否是 getInfo 方法
        if (t.isIdentifier(path.node.key) && path.node.key.name === 'getInfo') {
          // 在方法体内查找 return 语句
          path.traverse({
            ReturnStatement(returnPath) {
              const argument = returnPath.node.argument;
              if (t.isObjectExpression(argument)) {
                getInfoReturn = argument;
              }
            }
          });
        }
      }
    });

    return getInfoReturn;
  }

  /**
   * 提取翻译数据
   * 
   * 解析 Scratch.translate.setup() 调用，提取所有语言的翻译映射。
   * 翻译数据结构为：{ "语言代码": { "键": "翻译文本" } }
   * 
   * 例如：{ "zh-cn": { "_Text": "文本" }, "es": { "_Text": "Texto" } }
   * 
   * @param ast - AST 根节点
   * @returns 翻译数据对象，如果未找到则返回 undefined
   */
  private extractTranslations(ast: t.File): Record<string, Record<string, string>> | undefined {
    let translations: Record<string, Record<string, string>> | undefined;

    traverseFunc(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        
        // 检查是否是 Scratch.translate.setup 调用
        if (t.isMemberExpression(callee) &&
            t.isMemberExpression(callee.object) &&
            t.isIdentifier(callee.object.object) && callee.object.object.name === 'Scratch' &&
            t.isIdentifier(callee.object.property) && callee.object.property.name === 'translate' &&
            t.isIdentifier(callee.property) && callee.property.name === 'setup') {
          
          const arg = path.node.arguments[0];
          
          if (t.isObjectExpression(arg)) {
            translations = {};
            arg.properties.forEach(prop => {
              if (t.isObjectProperty(prop)) {
                let langCode: string | undefined;
                
                // 处理 StringLiteral 类型的键 (如 "es", "zh-cn")
                if (t.isStringLiteral(prop.key)) {
                  langCode = prop.key.value;
                }
                // 处理 Identifier 类型的键
                else if (t.isIdentifier(prop.key)) {
                  langCode = prop.key.name;
                }
                
                if (langCode && t.isObjectExpression(prop.value)) {
                  translations![langCode] = {};
                  prop.value.properties.forEach(transProp => {
                    if (t.isObjectProperty(transProp)) {
                      let key: string | undefined;
                      
                      // 处理 StringLiteral 类型的键
                      if (t.isStringLiteral(transProp.key)) {
                        key = transProp.key.value;
                      }
                      // 处理 Identifier 类型的键
                      else if (t.isIdentifier(transProp.key)) {
                        key = transProp.key.name;
                      }
                      
                      if (key && t.isStringLiteral(transProp.value)) {
                        translations![langCode][key] = transProp.value.value;
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }
    });

    return translations;
  }

  /**
   * 从 Scratch.translate 调用中提取文本
   */
  private extractTranslateCall(node: t.Node): string | undefined {
    if (!t.isCallExpression(node)) return undefined;
    
    const callee = node.callee;
    
    // 检查是否是 Scratch.translate 调用
    if (t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) && callee.object.name === 'Scratch' &&
        t.isIdentifier(callee.property) && callee.property.name === 'translate') {
      
      const arg = node.arguments[0];
      
      if (t.isStringLiteral(arg)) {
        return arg.value;
      } else if (t.isObjectExpression(arg)) {
        // 查找 default 属性
        for (const prop of arg.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'default') {
            if (t.isStringLiteral(prop.value)) {
              return prop.value.value;
            }
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * 从对象表达式中提取属性值
   */
  private getObjectPropertyValue(obj: t.ObjectExpression, propertyName: string): string | undefined {
    for (const prop of obj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === propertyName) {
        const value = prop.value;
        
        // 检查是否是字符串字面量
        if (t.isStringLiteral(value)) {
          return value.value;
        }
        
        // 检查是否是 Scratch.translate 调用
        if (t.isCallExpression(value)) {
          return this.extractTranslateCall(value);
        }
      }
    }
    return undefined;
  }

  /**
   * 提取扩展 ID
   */
  private extractId(ast: t.File): string {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return 'unknown';
    
    return this.getObjectPropertyValue(getInfo, 'id') || 'unknown';
  }

  /**
   * 提取扩展名称
   */
  private extractName(ast: t.File): string {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return 'Unknown Extension';
    
    return this.getObjectPropertyValue(getInfo, 'name') || 'Unknown Extension';
  }

  /**
   * 提取颜色值
   */
  private extractColor1(ast: t.File): string {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return '#ff4c4c';
    
    return this.getObjectPropertyValue(getInfo, 'color1') || '#ff4c4c';
  }

  private extractColor2(ast: t.File): string {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return '#d83e00';
    
    return this.getObjectPropertyValue(getInfo, 'color2') || '#d83e00';
  }

  private extractColor3(ast: t.File): string {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return '#8f5700';
    
    return this.getObjectPropertyValue(getInfo, 'color3') || '#8f5700';
  }

  /**
   * 提取图标 URI
   */
  private extractMenuIconURI(ast: t.File): string | undefined {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return undefined;
    
    return this.getObjectPropertyValue(getInfo, 'menuIconURI');
  }

  private extractBlockIconURI(ast: t.File): string | undefined {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return undefined;
    
    return this.getObjectPropertyValue(getInfo, 'blockIconURI');
  }

  /**
   * 提取文档 URI
   */
  private extractDocsURI(ast: t.File): string | undefined {
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return undefined;
    
    return this.getObjectPropertyValue(getInfo, 'docsURI');
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
  private extractBlocks(ast: t.File): BlockDefinition[] {
    const blocks: BlockDefinition[] = [];
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return blocks;

    const blocksProperties = getInfo.properties.filter(prop => 
      t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'blocks'
    );

    if (blocksProperties.length === 0) return blocks;
    
    const blocksProperty = blocksProperties[0] as t.ObjectProperty;
    if (!t.isArrayExpression(blocksProperty.value)) {
      return blocks;
    }

    const blocksArray = blocksProperty.value.elements;
    for (const element of blocksArray) {
      if (t.isObjectExpression(element)) {
        const block = this.parseBlock(element);
        if (block) {
          blocks.push(block);
        }
      } else if (t.isStringLiteral(element) && element.value === '---') {
        // 分隔符，跳过
        continue;
      }
    }

    return blocks;
  }

  /**
   * 解析单个积木
   */
  private parseBlock(blockObj: t.ObjectExpression): BlockDefinition | null {
    const block: BlockDefinition = {
      opcode: this.getObjectPropertyValue(blockObj, 'opcode') || '',
      blockType: this.extractBlockType(blockObj),
      text: this.getObjectPropertyValue(blockObj, 'text') || '',
      arguments: this.extractArguments(blockObj),
      isEdgeActivated: this.extractBooleanProperty(blockObj, 'isEdgeActivated', false),
      shouldRestartExistingThreads: this.extractBooleanProperty(blockObj, 'shouldRestartExistingThreads', false),
      disableMonitor: this.extractBooleanProperty(blockObj, 'disableMonitor', false),
      hideFromPalette: this.extractBooleanProperty(blockObj, 'hideFromPalette', false),
      filter: this.extractFilter(blockObj),
      isTerminal: this.extractBooleanProperty(blockObj, 'isTerminal', false),
      blockIconURI: this.getObjectPropertyValue(blockObj, 'blockIconURI'),
    };

    return block;
  }

  /**
   * 提取积木类型
   */
  private extractBlockType(blockObj: t.ObjectExpression): ExtensionBlockType {
    for (const prop of blockObj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'blockType') {
        const value = prop.value;
        if (t.isMemberExpression(value)) {
          // Scratch.BlockType.REPORTER -> value.object = Scratch.BlockType, value.property = REPORTER
          if (t.isMemberExpression(value.object) &&
              t.isIdentifier(value.object.object) && value.object.object.name === 'Scratch' &&
              t.isIdentifier(value.object.property) && value.object.property.name === 'BlockType' &&
              t.isIdentifier(value.property)) {
            const typeName = value.property.name;
            if (['COMMAND', 'REPORTER', 'BOOLEAN', 'HAT', 'EVENT'].includes(typeName)) {
              return typeName as ExtensionBlockType;
            }
          }
        }
      }
    }
    return 'COMMAND' as ExtensionBlockType;
  }

  /**
   * 提取参数定义
   */
  private extractArguments(blockObj: t.ObjectExpression): Record<string, ArgumentDefinition> {
    const args: Record<string, ArgumentDefinition> = {};

    const argumentsProperties = blockObj.properties.filter(prop => 
      t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'arguments'
    );

    if (argumentsProperties.length === 0) return args;
    
    const argumentsProperty = argumentsProperties[0] as t.ObjectProperty;
    if (!t.isObjectExpression(argumentsProperty.value)) {
      return args;
    }

    const argsObj = argumentsProperty.value;
    for (const prop of argsObj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const argName = prop.key.name;
        const value = prop.value;
        if (t.isObjectExpression(value)) {
          args[argName] = this.parseArgument(value);
        }
      }
    }

    return args;
  }

  /**
   * 解析单个参数
   */
  private parseArgument(argObj: t.ObjectExpression): ArgumentDefinition {
    const arg: ArgumentDefinition = {
      type: this.extractArgumentType(argObj),
      defaultValue: this.getObjectPropertyValue(argObj, 'defaultValue'),
      menu: this.getObjectPropertyValue(argObj, 'menu'),
      dataURI: this.getObjectPropertyValue(argObj, 'dataURI'),
      flipRTL: this.extractBooleanProperty(argObj, 'flipRTL', false),
    };

    return arg;
  }

  /**
   * 提取参数类型
   */
  private extractArgumentType(argObj: t.ObjectExpression): ExtensionArgumentType {
    for (const prop of argObj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'type') {
        const value = prop.value;
        if (t.isMemberExpression(value)) {
          // Scratch.ArgumentType.STRING -> value.object = Scratch.ArgumentType, value.property = STRING
          if (t.isMemberExpression(value.object) &&
              t.isIdentifier(value.object.object) && value.object.object.name === 'Scratch' &&
              t.isIdentifier(value.object.property) && value.object.property.name === 'ArgumentType' &&
              t.isIdentifier(value.property)) {
            const typeName = value.property.name;
            if (['STRING', 'NUMBER', 'BOOLEAN', 'COLOR', 'ANGLE', 'MATRIX', 'NOTE', 'IMAGE', 'COSTUME', 'SOUND'].includes(typeName)) {
              return typeName as ExtensionArgumentType;
            }
          }
        }
      }
    }
    return 'STRING' as ExtensionArgumentType;
  }

  /**
   * 提取过滤器
   */
  private extractFilter(blockObj: t.ObjectExpression): string[] | undefined {
    const filterProperties = blockObj.properties.filter(prop =>
      t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'filter'
    );

    if (filterProperties.length === 0) return undefined;
    
    const filterProperty = filterProperties[0] as t.ObjectProperty;
    if (!t.isArrayExpression(filterProperty.value)) {
      return undefined;
    }

    const filters: string[] = [];
    for (const element of filterProperty.value.elements) {
      if (t.isMemberExpression(element) &&
          t.isIdentifier(element.object) && element.object.name === 'Scratch' &&
          t.isIdentifier(element.property)) {
        filters.push(element.property.name);
      }
    }

    return filters.length > 0 ? filters : undefined;
  }

  /**
   * 提取所有菜单定义
   */
  private extractMenus(ast: t.File): Record<string, MenuDefinition> {
    const menus: Record<string, MenuDefinition> = {};
    const getInfo = this.findGetInfoReturn(ast);
    if (!getInfo) return menus;

    const menusProperties = getInfo.properties.filter(prop =>
      t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'menus'
    );

    if (menusProperties.length === 0) return menus;
    
    const menusProperty = menusProperties[0] as t.ObjectProperty;
    if (!t.isObjectExpression(menusProperty.value)) {
      return menus;
    }

    const menusObj = menusProperty.value;
    for (const prop of menusObj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const menuName = prop.key.name;
        const value = prop.value;
        if (t.isObjectExpression(value)) {
          menus[menuName] = this.parseMenu(value);
        }
      }
    }

    return menus;
  }

  /**
   * 解析单个菜单
   */
  private parseMenu(menuObj: t.ObjectExpression): MenuDefinition {
    const menu: MenuDefinition = {
      acceptReporters: this.extractBooleanProperty(menuObj, 'acceptReporters', true),
      items: this.extractMenuItems(menuObj),
    };

    return menu;
  }

  /**
   * 提取菜单项
   */
  private extractMenuItems(menuObj: t.ObjectExpression): Array<string | { text: string; value: string }> {
    const itemsProperties = menuObj.properties.filter(prop =>
      t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === 'items'
    );

    if (itemsProperties.length === 0) return [];
    
    const itemsProperty = itemsProperties[0] as t.ObjectProperty;
    if (!t.isArrayExpression(itemsProperty.value)) {
      return [];
    }

    const items: Array<string | { text: string; value: string }> = [];

    for (const element of itemsProperty.value.elements) {
      if (t.isStringLiteral(element)) {
        items.push(element.value);
      } else if (t.isObjectExpression(element)) {
        const text = this.getObjectPropertyValue(element, 'text');
        const value = this.getObjectPropertyValue(element, 'value');
        if (text && value) {
          items.push({ text, value });
        }
      }
    }

    return items;
  }

  /**
   * 提取布尔属性
   */
  private extractBooleanProperty(obj: t.ObjectExpression, propName: string, defaultValue: boolean): boolean {
    for (const prop of obj.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === propName) {
        const value = prop.value;
        if (t.isBooleanLiteral(value)) {
          return value.value;
        }
      }
    }
    return defaultValue;
  }

  /**
   * 生成积木的 scratchblocks 格式文本
   * 完全符合 scratchblocks 规范
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
            const menu = this.extensionMetadata.menus[arg.menu];
            if (menu.acceptReporters) {
              // 接受报告器的菜单：[menu v]
              placeholder = `[${arg.menu} v]`;
            } else {
              // 不接受报告器的菜单：直接显示第一个选项
              if (menu.items.length > 0) {
                const firstItem = menu.items[0];
                if (typeof firstItem === 'string') {
                  placeholder = firstItem;
                } else {
                  placeholder = firstItem.text;
                }
              }
            }
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
          // 报告器块：用圆括号包裹
          text = `(${text})`;
          break;
        case 'BOOLEAN':
          // 布尔块：用尖括号包裹
          text = `<${text}>`;
          break;
        case 'HAT':
          // Hat 块：添加 when 前缀
          if (!text.startsWith('when')) {
            text = `when ${text}`;
          }
          break;
        case 'EVENT':
          // 事件块：类似于 Hat 块
          if (!text.startsWith('when')) {
            text = `when ${text}`;
          }
          break;
      }

      results.push(text);
    }

    return results;
  }

  /**
   * 根据参数类型获取占位符（符合 scratchblocks 规范）
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
        // 角度参数使用圆形输入框
        return '(direction)';
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