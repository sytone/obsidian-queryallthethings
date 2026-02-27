# Migration to Deno

This document outlines the migration from Node.js to Deno for the Query All The Things plugin.

## Prerequisites

1. Install [Deno](https://deno.com/) (v1.40 or later recommended)
2. Install the [Deno VSCode extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

## Changes Made

### Configuration Files

- **Added `deno.jsonc`**: Main Deno configuration file with tasks, formatting, linting rules, and import mappings
- **Added `scripts/build.ts`**: Deno-based build script using esbuild (replaces `ophidian.config.mjs`)
- **Added `scripts/version-bump.ts`**: Deno script for version management

### VSCode Configuration

- **Updated `.vscode/settings.json`**: Enabled Deno language server and formatting
- **Updated `.vscode/tasks.json`**: Replaced npm tasks with Deno tasks
- **Updated `.vscode/extensions.json`**: Added Deno extension recommendation, removed Node-specific extensions

### Build System

The build system has been migrated from:
- **Old**: `@ophidian/build` with Node.js
- **New**: Custom esbuild-based build script running on Deno

## Development Workflow

### Building the Plugin

Development mode (with watch):
```bash
deno task dev
```

Production build:
```bash
deno task build
```

### Testing

Run tests:
```bash
deno task test
```

### Code Quality

Lint code:
```bash
deno task lint
```

Format code:
```bash
deno task fmt
```

### Version Bumping

Bump version (patch/minor/major):
```bash
deno task bump patch
deno task bump minor
deno task bump major
```

## Import Strategy

The project uses Deno's npm compatibility via the `imports` field in `deno.jsonc`. This allows using npm packages with the `npm:` specifier:

```typescript
import { Plugin } from 'obsidian';  // Maps to npm:obsidian
import * as alasql from 'alasql';   // Maps to npm:alasql
```

## Key Differences from Node.js

1. **No `node_modules`**: Dependencies are cached globally by Deno
2. **Explicit file extensions**: Import statements must include `.ts` extensions for local files
3. **Permission-based security**: Deno requires explicit permissions (handled via `-A` flag in tasks)
4. **Built-in tooling**: No need for separate formatters, linters, or test runners

## Backward Compatibility

- `package.json` is kept for documentation and compatibility purposes
- The npm ecosystem dependencies are accessed via `npm:` specifiers
- Build output remains compatible with Obsidian's plugin system

## Testing the Migration

1. Set environment variable for test vault:
   ```bash
   # PowerShell
   $env:OBSIDIAN_TEST_VAULT = "C:\path\to\your\test\vault"
   
   # Or add to your profile
   ```

2. Run development build:
   ```bash
   deno task dev
   ```

3. The plugin will be built to your test vault's `.obsidian/plugins/qatt/` directory

4. Open the vault in Obsidian and enable the plugin

## Troubleshooting

### VSCode shows import errors

1. Ensure the Deno extension is installed and enabled
2. Reload VSCode window
3. Check that `deno.enable` is true in `.vscode/settings.json`

### Build fails with permission errors

The build script uses `-A` flag for all permissions. In production, you may want to be more specific:
```bash
deno run --allow-read --allow-write --allow-env --allow-net scripts/build.ts
```

### Dependencies not found

Run to cache dependencies:
```bash
deno cache --reload src/main.ts
```

## Next Steps

After successful migration:

1. Test all plugin functionality thoroughly
2. Update CI/CD workflows to use Deno
3. Update documentation for contributors
4. Consider migrating tests to use Deno's built-in test runner
