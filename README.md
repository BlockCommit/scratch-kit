# scratch-kit

A full-featured tool for processing Scratch projects and related content.

## Features

- Parse .sb3 project files
- Transform and normalize Scratch projects
- Extract project metadata and statistics
- Validate project structure
- **Convert Scratch blocks to scratchblocks format**
- TypeScript support with full type definitions

## Installation

```bash
npm install scratch-kit
```

## Usage

### Basic Project Processing

```typescript
import { parseSb3File, transformProject, validateProject } from 'scratch-kit';

// Parse a .sb3 file
const project = await parseSb3File('project.sb3');

// Validate the project
if (validateProject(project)) {
  console.log('Valid project!');
}

// Transform the project
const transformed = transformProject(project, {
  normalizeBlocks: true,
  removeUnused: true
});
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

## API

### Project Processing

#### parseSb3File(filePath: string): Promise<ScratchProject>
Parses a Scratch .sb3 file and returns the project object.

#### transformProject(project: ScratchProject, options?: TransformOptions): ScratchProject
Transforms a Scratch project with various options.

#### validateProject(project: ScratchProject): boolean
Validates if a project object has the correct structure.

### Scratchblocks Conversion

#### toScratchblocks(scriptStart: string, blocks: Sb3Blocks, locale?: string, opts?: BlockOptions): string
Converts Scratch blocks to scratchblocks format.

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
```

## License

MIT
