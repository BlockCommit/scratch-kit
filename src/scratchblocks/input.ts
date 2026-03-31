/**
 * 输入类型实现
 */

import type { Inputtable, BlockOptions, Inputtables } from './types.js';

export type { Inputtable, Inputtables };

export class Sanitizer {
  static sanitize(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  static labelSanitize(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
  }
}

export class Menu implements Inputtable {
  constructor(
    public id: string | null,
    public opcode: string,
    public content: string
  ) {}

  blockSyntax(locale: string): string {
    // 这里需要从翻译映射中获取
    return this.content;
  }

  toScratchblocks(locale: string): string {
    return `[${Sanitizer.sanitize(this.content)} v]`;
  }
}

export class Input implements Inputtable {
  constructor(public value: string | number) {}

  toScratchblocks(): string {
    return String(this.value);
  }
}

export class NumberInput extends Input {}
export class StringInput extends Input {}
export class ColorPickerInput extends Input {}

export class BroadcastMenuInput extends Menu {}

export class EmptyBooleanInput implements Inputtable {
  toScratchblocks(): string {
    return '';
  }
}

export class Variable implements Inputtable {
  constructor(
    public id: string | null,
    public name: string,
    public type: 'variable' | 'list' | 'custom' = 'variable',
    public blockType?: string,
    public inputtables: Inputtables = {}
  ) {}

  toScratchblocks(locale: string, opts: BlockOptions): string {
    let suffix = '';
    if (opts.variableStyle === 'always') {
      suffix = '::' + this.type;
    } else if (opts.variableStyle === 'as-needed' && this.type === 'list') {
      suffix = '::list';
    }
    return `${Sanitizer.sanitize(this.name)}${suffix}`;
  }
}

export class Icon implements Inputtable {
  constructor(public iconType: 'greenFlag' | 'turnLeft' | 'turnRight') {}

  toScratchblocks(): string {
    switch (this.iconType) {
      case 'greenFlag':
        return '@greenFlag';
      case 'turnLeft':
        return '@turnLeft';
      case 'turnRight':
        return '@turnRight';
    }
  }
}

export class Stack implements Inputtable {
  constructor(public blocks: any[] = []) {}

  toScratchblocks(locale: string, opts: BlockOptions): string {
    const newOpts = { ...opts, _stackNum: (opts._stackNum || 1) + 1 };
    return this.blocks
      .map((block) => block.toScratchblocks(locale, newOpts))
      .join('\n');
  }
}
