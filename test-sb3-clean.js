/**
 * 完整版测试脚本：显示所有积木，包括不支持的
 */

import { parseSb3File } from './dist/parser.js';
import { toScratchblocks } from './dist/scratchblocks/parser.js';
import { writeFileSync } from 'fs';

async function testScratchblocksFull(filePath, outputFile) {
  try {
    console.log('正在解析 .sb3 文件...');
    const project = await parseSb3File(filePath);

    console.log(`找到 ${project.targets.length} 个目标（角色和舞台）`);

    const results = [];
    let successCount = 0;
    let partialSuccessCount = 0;
    let errorCount = 0;

    for (const target of project.targets) {
      const blocks = target.blocks || {};
      const targetName = target.name || 'Unnamed';
      const isStage = target.isStage;

      console.log(`\n处理: ${targetName} (${isStage ? '舞台' : '角色'})`);

      // 找到所有的 hat blocks
      const hatBlocks = Object.keys(blocks).filter(blockId => {
        const block = blocks[blockId];
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
          const scratchblocks = toScratchblocks(
            hatBlockId,
            blocks,
            'en',
            {
              tab: '    ',
              variableStyle: 'none'
            }
          );

          // 检查输出中是否有错误标记
          if (scratchblocks.includes('[错误:')) {
            // 有错误，但仍然显示内容
            partialSuccessCount++;
            targetResults.push(scratchblocks);
          } else {
            // 完全成功
            successCount++;
            targetResults.push(scratchblocks);
          }
          targetResults.push('\n');
        } catch (error) {
          errorCount++;
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
    console.log(`  完全成功: ${successCount} 个脚本`);
    console.log(`  部分成功: ${partialSuccessCount} 个脚本`);
    console.log(`  完全失败: ${errorCount} 个脚本`);

    // 显示摘要
    console.log('\n=== 转换摘要 ===');
    const lines = output.split('\n');
    console.log(`总行数: ${lines.length}`);
    console.log(`前 500 字符:\n${output.substring(0, 500)}...`);

  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

// 运行测试
const inputFile = process.argv[2] || '/home/neuronpulse/CodeSpaces/BlockCommit/25a05b.sb3';
const outputFile = process.argv[3] || '/home/neuronpulse/CodeSpaces/BlockCommit/scratch-kit/output-full.txt';

console.log('=== Scratchblocks 完整转换 ===');
console.log(`输入文件: ${inputFile}`);
console.log(`输出文件: ${outputFile}\n`);

testScratchblocksFull(inputFile, outputFile);