"use strict";
/**
 * TurboWarp 扩展解析测试脚本
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("./dist/extensions/index.js");
// 示例扩展代码（从文档中获取的 Hello World 扩展）
var exampleExtension = "(function(Scratch) {\n  'use strict';\n  if (!Scratch.extensions.unsandboxed) {\n    throw new Error('This Hello World example must run unsandboxed');\n  }\n  class HelloWorld {\n    getInfo() {\n      return {\n        id: 'helloworldunsandboxed',\n        name: 'Unsandboxed Hello World',\n        blocks: [\n          {\n            opcode: 'hello',\n            blockType: Scratch.BlockType.REPORTER,\n            text: 'Hello!'\n          }\n        ]\n      };\n    }\n    hello() {\n      return 'World!';\n    }\n  }\n  Scratch.extensions.register(new HelloWorld());\n})(Scratch)";
// 更复杂的示例（带参数和菜单）
var complexExtension = "(function(Scratch) {\n  'use strict';\n  if (!Scratch.extensions.unsandboxed) {\n    throw new Error('This example must run unsandboxed');\n  }\n  class ComplexExample {\n    getInfo() {\n      return {\n        id: 'complexexample',\n        name: 'Complex Example',\n        color1: '#4c97ff',\n        color2: '#3373cc',\n        color3: '#2a5ca8',\n        blocks: [\n          {\n            opcode: 'sayHello',\n            blockType: Scratch.BlockType.COMMAND,\n            text: 'say hello to [NAME]',\n            arguments: {\n              NAME: {\n                type: Scratch.ArgumentType.STRING,\n                defaultValue: 'World'\n              }\n            }\n          },\n          {\n            opcode: 'addNumbers',\n            blockType: Scratch.BlockType.REPORTER,\n            text: '[A] + [B]',\n            arguments: {\n              A: {\n                type: Scratch.ArgumentType.NUMBER,\n                defaultValue: '1'\n              },\n              B: {\n                type: Scratch.ArgumentType.NUMBER,\n                defaultValue: '2'\n              }\n            }\n          },\n          {\n            opcode: 'isGreaterThan',\n            blockType: Scratch.BlockType.BOOLEAN,\n            text: '[A] > [B]',\n            arguments: {\n              A: {\n                type: Scratch.ArgumentType.NUMBER\n              },\n              B: {\n                type: Scratch.ArgumentType.NUMBER\n              }\n            }\n          },\n          {\n            opcode: 'doSomething',\n            blockType: Scratch.BlockType.HAT,\n            text: 'when [CONDITION] is true',\n            isEdgeActivated: true,\n            arguments: {\n              CONDITION: {\n                type: Scratch.ArgumentType.BOOLEAN\n              }\n            }\n          }\n        ],\n        menus: {\n          ACTION_MENU: {\n            acceptReporters: true,\n            items: [\n              {\n                text: 'Jump',\n                value: 'jump'\n              },\n              {\n                text: 'Run',\n                value: 'run'\n              },\n              'fly'\n            ]\n          }\n        }\n      };\n    }\n    sayHello({NAME}) {\n      return `Hello, ${NAME}!`;\n    }\n    addNumbers({A, B}) {\n      return Scratch.Cast.toNumber(A) + Scratch.Cast.toNumber(B);\n    }\n    isGreaterThan({A, B}) {\n      return Scratch.Cast.compare(A, B) > 0;\n    }\n    doSomething({CONDITION}) {\n      return Scratch.Cast.toBoolean(CONDITION);\n    }\n  }\n  Scratch.extensions.register(new ComplexExample());\n})(Scratch)";
console.log('=== TurboWarp 扩展解析测试 ===\n');
// 测试 1: 解析简单扩展
console.log('测试 1: 简单扩展');
console.log('---');
var simpleResult = (0, index_js_1.parseExtension)(exampleExtension);
console.log('扩展 ID:', simpleResult.metadata.id);
console.log('扩展名称:', simpleResult.metadata.name);
console.log('积木数量:', simpleResult.metadata.blocks.length);
console.log('Scratchblocks 格式:');
simpleResult.scratchblocks.forEach(function (block) { return console.log("  ".concat(block)); });
console.log();
// 测试 2: 解析复杂扩展
console.log('测试 2: 复杂扩展');
console.log('---');
var complexResult = (0, index_js_1.parseExtension)(complexExtension);
console.log('扩展 ID:', complexResult.metadata.id);
console.log('扩展名称:', complexResult.metadata.name);
console.log('颜色:', complexResult.metadata.color1, complexResult.metadata.color2, complexResult.metadata.color3);
console.log('积木数量:', complexResult.metadata.blocks.length);
console.log('\n积木详情:');
complexResult.metadata.blocks.forEach(function (block) {
    console.log("  ".concat(block.opcode, " (").concat(block.blockType, "): ").concat(block.text));
    if (Object.keys(block.arguments).length > 0) {
        console.log("    \u53C2\u6570:", Object.keys(block.arguments));
    }
});
console.log('\nScratchblocks 格式:');
complexResult.scratchblocks.forEach(function (block) { return console.log("  ".concat(block)); });
console.log('\n菜单:');
Object.entries(complexResult.metadata.menus).forEach(function (_a) {
    var name = _a[0], menu = _a[1];
    console.log("  ".concat(name, ":"), menu.items.length, 'items');
    menu.items.forEach(function (item) {
        if (typeof item === 'object') {
            console.log("    - ".concat(item.text, " (").concat(item.value, ")"));
        }
        else {
            console.log("    - ".concat(item));
        }
    });
});
console.log();
// 测试 3: 验证扩展
console.log('测试 3: 验证扩展');
console.log('---');
var validation = (0, index_js_1.validateExtension)(complexResult.metadata);
console.log('验证结果:', validation.valid ? '✓ 有效' : '✗ 无效');
if (!validation.valid) {
    console.log('错误:');
    validation.errors.forEach(function (error) { return console.log("  - ".concat(error)); });
}
console.log();
// 测试 4: TypeScript 类型定义
console.log('测试 4: TypeScript 类型定义');
console.log('---');
console.log(complexResult.typeDefinitions);
console.log();
// 测试 5: JSON 导出
console.log('测试 5: JSON 导出');
console.log('---');
var jsonParsed = JSON.parse(complexResult.json);
console.log('扩展 ID:', jsonParsed.id);
console.log('积木数量:', jsonParsed.blocks.length);
console.log('第一个积木:', jsonParsed.blocks[0]);
console.log();
console.log('=== 测试完成 ===');
