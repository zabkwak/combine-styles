# combine-styles-processor
Module for merge styles in the project.

The module scans directories and merges all `.css` and `.scss` files in one minified css file.

## Installation
```bash
npm install combine-styles-processor --save
```

## Usage
```typescript
import Processor from 'combine-styles-processor';

const processor = new Processor([/* .. dirs or files to process */], outFile);

await processor.process();

```
## Sass import
The sass processor cannot recognize relative paths in the sass import. However relative paths from the working directory works. For imports in node_modules can be used ~.

## TODO
- CLI
- Plugins
- Update relative paths in the sass import