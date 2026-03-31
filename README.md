# scratch-kit

A comprehensive toolkit for processing Scratch projects, extensions, and related content.

## Features

### Project Processing
- Parse and analyze .sb3 project files
- Extract project metadata and statistics
- Transform and normalize Scratch projects
- Validate project structure
- Detect project platform (Scratch, TurboWarp, etc.)
- Extract project resources (costumes, sounds, backdrops)

### Extension Support
- Parse TurboWarp extensions using Babel AST
- Extract extension metadata (ID, name, colors, blocks, menus)
- Generate scratchblocks format text compliant with specifications
- Support internationalization (Scratch.translate)
- Extract translation data from extensions
- Generate TypeScript type definitions from extensions
- Validate extension metadata

### Scratchblocks Conversion
- Convert Scratch blocks to scratchblocks format
- Full support for all block types and arguments
- Parameter placeholder generation according to specifications
- Locale support for different languages

## Installation

```bash
npm install scratch-kit
```

## Usage

### SB3 Project Analysis

```typescript
import { SB3Parser } from 'scratch-kit';

// Parse a .sb3 file
const parser = new SB3Parser('project.sb3');
const project = await parser.parse();

// Access project information
console.log('Project:', project.info.name);
console.log('Sprites:', project.info.spriteCount);
console.log('Blocks:', project.info.totalBlocks);
console.log('Platform:', project.info.platform?.name);
console.log('Extensions:', project.info.extensions);

// Access sprite details
project.sprites.forEach(sprite => {
  console.log(`${sprite.name}: ${sprite.blockCount} blocks`);
});

// Access resources
project.resources.forEach(resource => {
  console.log(`${resource.name} (${resource.type}): ${resource.size} bytes`);
});
```

### TurboWarp Extension Parsing

```typescript
import { ExtensionParser, parseExtension } from 'scratch-kit';

// Parse extension from source code
const sourceCode = `
  (function(Scratch) {
    class MyExtension {
      getInfo() {
        return {
          id: 'myext',
          name: 'My Extension',
          blocks: [
            {
              opcode: 'move',
              blockType: Scratch.BlockType.COMMAND,
              text: 'move {STEPS} steps',
              arguments: {
                STEPS: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: '10'
                }
              }
            }
          ]
        };
      }
    }
    Scratch.extensions.register(new MyExtension());
  })(Scratch)
`;

const parser = new ExtensionParser(sourceCode);
const metadata = parser.parse();

// Generate scratchblocks format
const scratchblocks = parser.generateScratchblocks();
console.log(scratchblocks);
// Output: ['move [number] steps']

// Get TypeScript type definitions
const types = parser.toTypeScript();
console.log(types);

// Export as JSON
const json = parser.toJSON();

// Parse extension with helper function
const result = parseExtension(sourceCode);
console.log(result.metadata);
console.log(result.scratchblocks);
console.log(result.typeDefinitions);
```

### Extension Validation

```typescript
import { validateExtension } from 'scratch-kit';

const metadata = parser.parse();
const validation = validateExtension(metadata);

if (validation.valid) {
  console.log('Extension is valid!');
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Scratchblocks Conversion

```typescript
import { toScratchblocks } from 'scratch-kit';

// Convert Scratch blocks to scratchblocks format
const blocks = {
  'blockId1': {
    opcode: 'event_whenflagclicked',
    next: 'blockId2',
    parent: null,
    inputs: {},
    fields: {}
  },
  'blockId2': {
    opcode: 'motion_movesteps',
    next: null,
    parent: 'blockId1',
    inputs: {
      STEPS: [1, [10, 4.5]]
    },
    fields: {}
  }
};

const scratchblocksCode = toScratchblocks('blockId1', blocks, 'en', {
  tab: '    ',
  variableStyle: 'none'
});

console.log(scratchblocksCode);
// Output:
// @greenFlag
// move (10) steps
```

## API Reference

### SB3 Project Analysis

#### SB3Parser
Parser for Scratch 3.0 .sb3 files.

**Constructor:**
```typescript
new SB3Parser(filePath: string, options?: SB3ParseOptions)
```

**Methods:**
- `parse(): Promise<SB3Project>` - Parse the SB3 file and return project information

**Types:**
- `SB3Project` - Complete project information
- `SB3ProjectInfo` - Project metadata and statistics
- `SpriteInfo` - Sprite/stage details
- `ResourceInfo` - Resource file information
- `PlatformInfo` - Platform detection results

### Extension Parsing

#### ExtensionParser
Parser for TurboWarp extensions using Babel AST.

**Constructor:**
```typescript
new ExtensionParser(sourceCode: string)
```

**Methods:**
- `parse(): ExtensionMetadata` - Parse extension and extract metadata
- `generateScratchblocks(): string[]` - Generate scratchblocks format text
- `toTypeScript(): string` - Generate TypeScript type definitions
- `toJSON(): string` - Export as JSON

**Helper Functions:**
- `parseExtension(sourceCode: string): ParsedExtension` - Parse and return all information
- `validateExtension(metadata: ExtensionMetadata): ValidationResult` - Validate extension metadata
- `createParser(sourceCode: string): ExtensionParser` - Create parser instance

**Types:**
- `ExtensionMetadata` - Complete extension metadata
- `BlockDefinition` - Block definition
- `ArgumentDefinition` - Argument definition
- `MenuDefinition` - Menu definition
- `TranslationData` - Internationalization data

### Scratchblocks Conversion

#### toScratchblocks
Convert Scratch blocks to scratchblocks format.

```typescript
toScratchblocks(
  scriptStart: string,
  blocks: Sb3Blocks,
  locale?: string,
  opts?: BlockOptions
): string
```

**Parameters:**
- `scriptStart`: The block ID to start parsing from (must be a hat block or stack block)
- `blocks`: Serialized SB3 format blocks object
- `locale`: Locale to use (default: 'en')
- `opts`: Optional configuration object
  - `tab`: Tab characters for indentation (default: 4 spaces)
  - `variableStyle`: How to display variables - 'none', 'always', or 'as-needed' (default: 'none')

### Supporting Types

The library exports various classes and types for advanced usage:

- **Block Types**: `Block`, `BooleanBlock`, `CBlock`, `EBlock`, `ReporterBlock`, `Definition`, `ProcedureCall`
- **Input Types**: `Menu`, `Input`, `NumberInput`, `StringInput`, `ColorPickerInput`, `Variable`, `Icon`, `Stack`
- **Utilities**: `Sanitizer`, `BlockType`, `BlockOptions`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev

# Lint
npm run lint

# Test
npm test
```

## License

MIT
