/**
 * 解析器 - 将 sb3 块转换为格式化的 scratchblocks
 */

import type { Connectable, Inputtables, BlockOptions, Inputtable } from './types.js';
import { Block, BooleanBlock, CBlock, EBlock, ReporterBlock, Definition, ProcedureCall } from './blocks.js';
import { Menu, Icon, Variable, Stack, NumberInput, StringInput, ColorPickerInput, BroadcastMenuInput, EmptyBooleanInput, Input } from './input.js';
import { allBlocks, BlockType, getMessageForLocale, getOptsForLocale } from './block-mapping.js';

const BLOCK_INSERTED_NO_DEFAULT = 2;
const BLOCK_INSERTED_DEFAULT = 3;

const opcodeToIcon: Record<string, Icon> = {
  event_whenflagclicked: new Icon('greenFlag'),
  motion_turnleft: new Icon('turnLeft'),
  motion_turnright: new Icon('turnRight'),
};

type InputConstructor = new (...args: any[]) => Inputtable;

const inputMap: Record<number, InputConstructor> = {
  9: ColorPickerInput,
  10: StringInput,
  11: BroadcastMenuInput,
};

interface Sb3Block {
  id: string;
  opcode: string;
  next: string | null;
  parent: string | null;
  inputs: Record<string, [number, any]>;
  fields: Record<string, [any, any]>;
  mutation?: any;
}

interface Sb3Blocks {
  [blockId: string]: Sb3Block;
}

function getInputtablesForBlock(block: Sb3Block, blocks: Sb3Blocks, asScript: boolean): Inputtables {
  const inputtables: Inputtables = {};
  const opcode = block.opcode;
  const blockInfo = allBlocks[opcode];

  // 处理图标
  if (blockInfo.defaultMessage.includes('{ICON}')) {
    inputtables.ICON = opcodeToIcon[opcode];
  }

  // 处理字段
  Object.keys(block.fields).forEach((key) => {
    inputtables[key] = new Menu(null, opcode, block.fields[key][0]);
  });

  // 处理输入
  Object.keys(block.inputs).forEach((key) => {
    const value = block.inputs[key];
    const shadowType = value[0];

    // C/E 块的子栈
    if (key.startsWith('SUBSTACK') && asScript) {
      inputtables[key] = new Stack(parseScript(value[1], blocks));
      return;
    }

    const isInputVariable = Array.isArray(value[1]) && value[1][0] > 11;

    if (
      !isInputVariable &&
      (shadowType === BLOCK_INSERTED_DEFAULT || shadowType === BLOCK_INSERTED_NO_DEFAULT)
    ) {
      // 有块在上面
      inputtables[key] = parseInsertedBlock(value[1], blocks);
      return;
    }

    // 没有块在上面，处理变量、数字、字符串或菜单
    if (typeof value[1] === 'string') {
      // 值是字符串，所以是菜单
      const menuBlockId = value[1];
      const menu = blocks[menuBlockId];

      if (menu.opcode === 'note') {
        // Note 不是菜单
        inputtables[key] = new NumberInput(menu.fields.NOTE[0]);
      } else {
        const fieldKey = blockInfo.remap?.[key] || key;
        if (!menu.fields[fieldKey]) {
          throw new Error(
            `Non-existent key ${fieldKey}/${key} for menu opcode ${opcode}, known: ${Object.keys(menu.fields)}`
          );
        }
        inputtables[key] = new Menu(menuBlockId, opcode, menu.fields[fieldKey][0]);
      }
    } else {
      // 值可能是数组
      const inputDetails = value[1];
      const inputType = inputDetails[0];

      if (inputType === 12) {
        // 普通变量块
        inputtables[key] = new Variable(null, inputDetails[1]);
        return;
      }

      if (inputType === 13) {
        // 普通列表块
        inputtables[key] = new Variable(null, inputDetails[1], 'list');
        return;
      }

      const InputConstructor = inputMap[inputType] || NumberInput;
      inputtables[key] = new InputConstructor(inputDetails[1]);
    }
  });

  // 确保子栈存在
  if (asScript && !inputtables.SUBSTACK) {
    inputtables.SUBSTACK = new Stack();
  }

  // 确保第二个子栈存在（E 块）
  if (blockInfo.type === BlockType.E_BLOCK && !inputtables.SUBSTACK2) {
    inputtables.SUBSTACK2 = new Stack();
  }

  // 处理布尔参数
  if (blockInfo.boolArg) {
    blockInfo.boolArg.forEach((boolArg) => {
      if (!inputtables[boolArg]) {
        inputtables[boolArg] = new EmptyBooleanInput();
      }
    });
  }

  return inputtables;
}

function parseInsertedBlock(blockId: string, blocks: Sb3Blocks): Connectable {
  const block = blocks[blockId];
  const opcode = block.opcode;

  if (opcode === 'argument_reporter_string_number') {
    return new Variable(blockId, block.fields.VALUE[0], 'custom', 'REPORTER_BLOCK');
  }

  if (opcode === 'argument_reporter_boolean') {
    return new Variable(blockId, block.fields.VALUE[0], 'custom', 'BOOLEAN_BLOCK');
  }

  const blockInfo = allBlocks[opcode];
  if (!blockInfo) {
    throw new Error(`Unknown block info for opcode ${opcode}`);
  }

  let BlockConstructor: new (id: string, opcode: string, inputtables: Inputtables) => Connectable = Block;
  switch (blockInfo.type) {
    case BlockType.BOOLEAN_BLOCK:
      BlockConstructor = BooleanBlock;
      break;
    case BlockType.REPORTER_BLOCK:
      BlockConstructor = ReporterBlock;
      break;
  }

  // @ts-ignore
  return new BlockConstructor(blockId, opcode, getInputtablesForBlock(block, blocks));
}

function getDefinition(block: Sb3Block, blocks: Sb3Blocks): Definition {
  const definitionId = block.inputs.custom_block[1];
  const definition = blocks[definitionId];

  const args = { s: [] as string[], b: [] as string[] };
  const counts = { s: 0, b: 0 };

  JSON.parse(definition.mutation.argumentids).forEach((argId: string) => {
    argId = definition.inputs[argId][1];
    const argBlock = blocks[argId];
    const arg = argBlock.fields.VALUE[0];

    if (argBlock.opcode === 'argument_reporter_string_number') {
      args.s.push(`(${arg})`);
    } else {
      args.b.push(`<${arg}>`);
    }
  });

  const proccode = definition.mutation.proccode.replace(/%([sb])/g, (_: string, s_b: string) => {
    return args[s_b as keyof typeof args][counts[s_b as keyof typeof counts]++];
  });

  // 检测是否有 return 块以及是否是布尔报告器
  let hasReturn = false;
  let isBooleanReporter = false;

  // 扫描这个积木的所有块，查找 procedures_return
  const stackBlocks = getAllBlocksInStack(definition.id, blocks);
  for (const stackBlock of stackBlocks) {
    if (stackBlock.opcode === 'procedures_return') {
      hasReturn = true;
      // 检查 return 块的输入是否是布尔值
      const returnInput = stackBlock.inputs.VALUE;
      if (returnInput && Array.isArray(returnInput) && returnInput.length > 1) {
        const inputBlockId = returnInput[1];
        const inputBlock = blocks[inputBlockId];
        if (inputBlock) {
          const blockInfo = allBlocks[inputBlock.opcode];
          if (blockInfo && blockInfo.type === BlockType.BOOLEAN_BLOCK) {
            isBooleanReporter = true;
          }
        }
      }
      break;
    }
  }

  return new Definition(block.id || '', proccode, {}, hasReturn, isBooleanReporter);
}

// 获取一个栈中的所有块（包括嵌套的子栈）
function getAllBlocksInStack(startBlockId: string, blocks: Sb3Blocks): Sb3Block[] {
  const result: Sb3Block[] = [];
  let currentId = startBlockId;

  while (currentId) {
    const block = blocks[currentId];
    if (!block) break;

    result.push(block);

    // 处理 C 块和 E 块的子栈
    Object.keys(block.inputs).forEach(key => {
      if (key.startsWith('SUBSTACK')) {
        const input = block.inputs[key];
        if (Array.isArray(input) && input.length > 1) {
          const subStackBlocks = getAllBlocksInStack(input[1], blocks);
          result.push(...subStackBlocks);
        }
      }
    });

    currentId = block.next;
  }

  return result;
}

function getProcCallArgs(block: Sb3Block, blocks: Sb3Blocks): Inputtables {
  const argIDs = JSON.parse(block.mutation.argumentids);
  const argObjs: Inputtables = {};
  let i = 0;

  Array.from(block.mutation.proccode.matchAll(/%([sb])/g)).forEach((matchObj) => {
    const s_b = (matchObj as RegExpMatchArray)[1];
    const id = argIDs[i++];
    let argObj = null;

    const input = block.inputs[id];

    if (s_b === 'b' && !input) {
      argObj = new EmptyBooleanInput();
    } else {
      const shadowType = input[0];
      const isInputVariable = Array.isArray(input[1]) && input[1][0] > 11;

      if (
        !isInputVariable &&
        (shadowType === BLOCK_INSERTED_DEFAULT || shadowType === BLOCK_INSERTED_NO_DEFAULT)
      ) {
        argObj = parseInsertedBlock(input[1], blocks);
      } else {
        const inputDetails = input[1];
        const inputType = inputDetails[0];

        if (inputType === 12) {
          argObj = new Variable(null, inputDetails[1]);
        } else if (inputType === 13) {
          argObj = new Variable(null, inputDetails[1], 'list');
        } else {
          argObj = new StringInput(inputDetails[1]);
        }
      }
    }

    argObjs[id] = argObj;
  });

  return argObjs;
}

// 查找自定义积木的定义
function findProcedureDefinition(proccode: string, blocks: Sb3Blocks): Definition | null {
  for (const blockId of Object.keys(blocks)) {
    const block = blocks[blockId];
    if (block.opcode === 'procedures_definition' && 
        block.mutation && 
        block.mutation.proccode === proccode) {
      try {
        return getDefinition(block, blocks);
      } catch (error) {
        console.error(`  错误: 无法解析定义 ${proccode}: ${error.message}`);
        return null;
      }
    }
  }
  return null;
}

export function parseScript(scriptStart: string, blocks: Sb3Blocks): Connectable[] {
  let blockId = scriptStart;
  const parsedBlocks: Connectable[] = [];

  do {
    const block = blocks[blockId];
    let parsedBlock: Connectable;

    const opcode = block.opcode;
    const blockInfo = allBlocks[opcode];

    if (!blockInfo) {
      console.warn('Unknown opcode: ', opcode);
      blockId = block.next;
      continue;
    }

    if (opcode === 'procedures_definition') {
      try {
        parsedBlock = getDefinition(block, blocks);
      } catch (error) {
        console.error(`  错误: Cannot parse definition: ${error.message}`);
        parsedBlock = new Definition(block.id || '', 'unknown_definition');
      }
    } else if (opcode === 'procedures_call') {
      try {
        // 查找对应的定义，检查是否是报告器
        const definition = findProcedureDefinition(block.mutation?.proccode || '', blocks);
        const isReporter = definition?.hasReturn || false;
        const isBooleanReporter = definition?.isBooleanReporter || false;

        parsedBlock = new ProcedureCall(
          block.id || '',
          block.mutation?.proccode || 'unknown_call',
          getProcCallArgs(block, blocks),
          isReporter,
          isBooleanReporter
        );
      } catch (error) {
        console.error(`  错误: Cannot parse procedure call: ${error.message}`);
        parsedBlock = new ProcedureCall(
          block.id || '',
          block.mutation?.proccode || 'unknown_call',
          {},
          false,
          false
        );
      }
    } else {
      const blockType = blockInfo.type || BlockType.BLOCK;

      switch (blockType) {
        case BlockType.BLOCK:
          // @ts-ignore
          parsedBlock = new Block(block.id || '', opcode, getInputtablesForBlock(block, blocks));
          break;
        case BlockType.C_BLOCK:
          // @ts-ignore
          parsedBlock = new CBlock(block.id || '', opcode, getInputtablesForBlock(block, blocks, true));
          break;
        case BlockType.E_BLOCK:
          // @ts-ignore
          parsedBlock = new EBlock(block.id || '', opcode, getInputtablesForBlock(block, blocks, true));
          break;
        case BlockType.BOOLEAN_BLOCK:
          // @ts-ignore
          parsedBlock = new BooleanBlock(block.id || '', opcode, getInputtablesForBlock(block, blocks));
          break;
        case BlockType.REPORTER_BLOCK:
          // @ts-ignore
          parsedBlock = new ReporterBlock(block.id || '', opcode, getInputtablesForBlock(block, blocks));
          break;
        default:
          // @ts-ignore
          parsedBlock = new Block(block.id || '', opcode, getInputtablesForBlock(block, blocks));
      }
    }

    parsedBlocks.push(parsedBlock);
    blockId = block.next;
  } while (blockId);

  return parsedBlocks;
}

export function toScratchblocks(
  scriptStart: string,
  blocks: Sb3Blocks,
  locale: string = 'en',
  opts: BlockOptions = {}
): string {
  const defaultOpts: BlockOptions = {
    tab: '    ',
    variableStyle: 'none',
    _stackNum: 0,
  };

  const mergedOpts = { ...defaultOpts, ...opts };
  const parsed = parseScript(scriptStart, blocks);

  return parsed
    .map((block) => {
      // 检查是否是自定义积木定义或调用（使用 instanceof 而不是 opcode）
      if (block instanceof Definition || block instanceof ProcedureCall) {
        return block.toScratchblocks(locale, mergedOpts);
      }
      // 其他块类型
      try {
        return block.toScratchblocks(locale, mergedOpts, getMessageForLocale, getOptsForLocale);
      } catch (error) {
        console.error(`  错误: ${error.message}`);
        return `[错误: ${error.message}]`;
      }
    })
    .join('\n');
}