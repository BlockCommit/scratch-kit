/**
 * 块类型实现
 */

import type { Connectable, Inputtables, BlockOptions } from './types.js';
import { Menu, Icon, Variable, Stack, Inputtable } from './input.js';

export class Block implements Connectable {
  constructor(
    public id: string,
    public opcode: string,
    public inputtables: Inputtables = {}
  ) {}

  blockSyntax(locale: string, opts: BlockOptions, getMessage: (locale: string, opcode: string) => string): string {
    const syntax = getMessage(locale, this.opcode);
    return syntax.replace(/\{([\w-]+)\}/g, (_, key) => {
      const input = this.inputtables[key];
      return input ? input.toScratchblocks(locale, opts) : '';
    });
  }

  useOptions(locale: string, opts: BlockOptions, getOpts: (locale: string, opcode: string) => Record<string, string>): string {
    const blockOpts = getOpts(locale, this.opcode);
    const optionArray: string[] = [];
    if (blockOpts.category) optionArray.push(blockOpts.category);
    if (blockOpts.type) optionArray.push(blockOpts.type);
    if (optionArray.length) return `::${optionArray.join(' ')}`;
    return '';
  }

  toScratchblocks(locale: string, opts: BlockOptions, getMessage: (locale: string, opcode: string) => string, getOpts: (locale: string, opcode: string) => Record<string, string>): string {
    return `${this.blockSyntax(locale, opts, getMessage)}${this.useOptions(locale, opts, getOpts)}`;
  }
}

export class BooleanBlock extends Block {}

export class ReporterBlock extends Block {}

export class CBlock extends Block {
  constructor(
    id: string,
    opcode: string,
    inputtables: Inputtables,
    public blockKey: string = 'SUBSTACK'
  ) {
    super(id, opcode, inputtables);
  }

  toScratchblocks(locale: string, opts: BlockOptions, getMessage: (locale: string, opcode: string) => string, getOpts: (locale: string, opcode: string) => Record<string, string>): string {
    const blockLabel = this.blockSyntax(locale, opts, getMessage);
    const blocks = this.inputtables[this.blockKey].toScratchblocks(locale, opts);
    const end = 'end';
    const tab = (opts.tab || '    ').repeat((opts._stackNum || 1) - 1);
    return `${blockLabel}${this.useOptions(locale, opts, getOpts)}\n${blocks}\n${tab}${end}`;
  }
}

export class EBlock extends CBlock {
  constructor(
    id: string,
    opcode: string,
    inputtables: Inputtables
  ) {
    super(id, opcode, inputtables);
    this.blockKey = 'SUBSTACK';
  }

  toScratchblocks(locale: string, opts: BlockOptions, getMessage: (locale: string, opcode: string) => string, getOpts: (locale: string, opcode: string) => Record<string, string>): string {
    const blockLabel = this.blockSyntax(locale, opts, getMessage);
    const blocks1 = this.inputtables.SUBSTACK.toScratchblocks(locale, opts);
    const blocks2 = this.inputtables.SUBSTACK2.toScratchblocks(locale, opts);
    const end = 'end';
    const tab = (opts.tab || '    ').repeat((opts._stackNum || 1) - 1);
    return `${blockLabel}${this.useOptions(locale, opts, getOpts)}\n${blocks1}\n${tab}else\n${blocks2}\n${tab}${end}`;
  }
}

export class Definition implements Connectable {
  constructor(
    public id: string,
    public proccode: string,
    public inputtables: Inputtables = {},
    public hasReturn: boolean = false,
    public isBooleanReporter: boolean = false
  ) {}

  toScratchblocks(locale: string, opts: BlockOptions): string {
    const prefix = this.hasReturn ? (this.isBooleanReporter ? 'report ' : 'reporter ') : 'define ';
    return `${prefix}${this.proccode}`;
  }
}

export class ProcedureCall implements Connectable {
  constructor(
    public id: string,
    public proccode: string,
    public inputtables: Inputtables = {},
    public isReporter: boolean = false,
    public isBooleanReporter: boolean = false
  ) {}

  toScratchblocks(locale: string, opts: BlockOptions): string {
    const args = Object.values(this.inputtables)
      .map((input) => input.toScratchblocks(locale, opts))
      .join(' ');

    if (this.isReporter) {
      // 自定义报告器
      return `${this.isBooleanReporter ? '<' : '('}${this.proccode} ${args}${this.isBooleanReporter ? '>' : ')'}`;
    }
    // 普通积木调用
    return `${this.proccode} ${args}`;
  }
}
