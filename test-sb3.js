/**
 * 测试脚本：解析 .sb3 文件并转换为 scratchblocks 格式
 */

import { parseSb3File } from './dist/parser.js';
import { toScratchblocks } from './dist/scratchblocks/parser.js';
import { writeFileSync } from 'fs';

async function testScratchblocks(filePath, outputFile) {
  try {
    console.log('正在解析 .sb3 文件...');
    const project = await parseSb3File(filePath);

    console.log(`找到 ${project.targets.length} 个目标（角色和舞台）`);

    const results = [];

    for (const target of project.targets) {
      const blocks = target.blocks || {};
      const targetName = target.name || 'Unnamed';
      const isStage = target.isStage;

      console.log(`\n处理: ${targetName} (${isStage ? '舞台' : '角色'})`);

      // 找到所有的 hat blocks（脚本的起始块）
      const hatBlocks = Object.keys(blocks).filter(blockId => {
        const block = blocks[blockId];
        const opcode = block.opcode;
        // hat blocks 的特征：parent 为 null
        return block.parent === null || block.parent === '';
      });

      console.log(`  找到 ${hatBlocks.length} 个脚本`);

      if (hatBlocks.length === 0) {
        results.push(`\n=== ${targetName} ===\n(无脚本)\n`);
        continue;
      }

      const targetResults = [];
      targetResults.push(`\n=== ${targetName} ===\n`);

      for (const hatBlockId of hatBlocks) {
        try {
          const block = blocks[hatBlockId];
          const opcode = block.opcode;

          console.log(`  转换脚本: ${opcode}`);

          const scratchblocks = toScratchblocks(
            hatBlockId,
            blocks,
            'en',
            {
              tab: '    ',
              variableStyle: 'none'
            }
          );

          targetResults.push(scratchblocks);
          targetResults.push('\n');
        } catch (error) {
          console.error(`  错误: ${error.message}`);
          targetResults.push(`[错误: ${error.message}]\n`);
        }
      }

      results.push(targetResults.join(''));
    }

    const output = results.join('\n');

    // 写入文件
    writeFileSync(outputFile, output, 'utf-8');
    console.log(`\n✓ 输出已保存到: ${outputFile}`);
    console.log(`  总字符数: ${output.length}`);

    // 同时输出摘要到控制台
    console.log('\n=== 输出摘要 ===');
    console.log(output.substring(0, 500) + '...');

  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

// 运行测试
const inputFile = process.argv[2] || '/home/neuronpulse/CodeSpaces/BlockCommit/25a05b.sb3';
const outputFile = process.argv[3] || '/home/neuronpulse/CodeSpaces/BlockCommit/scratch-kit/output.txt';

console.log('=== Scratchblocks 转换测试 ===');
console.log(`输入文件: ${inputFile}`);
console.log(`输出文件: ${outputFile}\n`);

testScratchblocks(inputFile, outputFile);