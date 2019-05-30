# combine-styles
Module for merge styles in the project.

The module scans directories and merges all `.css` and `.scss` files in one minified css file.

## Installation
```bash
npm install combine-styles --save
```

## Usage
```typescript
import Processor from 'combine-styles';

const processor = new Processor([/* .. dirs to process */], outFile);

await processor.process();

```
## Sass import
The sass processor cannot recognize relative paths in the sass import. However relative paths from the working directory works. For imports in node_modules can be used ~.

## TODO
- CLI
- Plugins
- Update relative paths in the sass import