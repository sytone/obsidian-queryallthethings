# Node.js to Deno Migration Summary

This document summarizes the migration of the Query All The Things Obsidian plugin from Node.js to Deno.

## ✅ Completed Tasks

### 1. Deno Configuration Files

- **Created `deno.jsonc`**: Main configuration file with:
  - Task definitions (dev, build, test, lint, fmt, bump)
  - Formatting and linting rules
  - Compiler options
  - Import mappings for npm packages and local modules
  
- **Added import maps**: Configured to support the existing TypeScript path mappings:
  - All npm dependencies use `npm:` specifier
  - Local modules mapped to `./src/` directories
  - This allows keeping the existing import structure minimal changes

### 2. Build System Migration

- **Created `scripts/build.ts`**: Deno-based build script that:
  - Converts YAML files to JSON (replaces the YAML processing in ophidian.config.mjs)
  - Uses esbuild for bundling
  - Supports development mode with watch
  - Supports production builds with minification
  - Copies manifest and styles to output directory
  - Respects `OBSIDIAN_TEST_VAULT` environment variable

- **Created `scripts/version-bump.ts`**: Automated version management:
  - Bumps version in manifest.json, manifest-beta.json, versions.json
  - Maintains package.json for compatibility
  - Supports patch/minor/major version bumps

### 3. VSCode Integration

- **Updated `.vscode/settings.json`**:
  - Enabled Deno language server
  - Configured Deno as default formatter for TypeScript/JavaScript/JSON
  - Maintained existing settings for markdown and spell checker

- **Updated `.vscode/tasks.json`**:
  - Replaced npm tasks with Deno tasks
  - Set `deno: dev` as the default build task
  - Added tasks for: dev, build, test, lint, fmt

- **Updated `.vscode/extensions.json`**:
  - Added `denoland.vscode-deno` as recommended extension
  - Removed Node.js-specific extensions (eslint, jest)

### 4. CI/CD Workflow

- **Created `.github/workflows/deno-ci.yml`**:
  - GitHub Actions workflow for Deno
  - Runs on main and deno branches
  - Steps: checkout, setup Deno, format check, lint, test, build
  - Uploads build artifacts

### 5. Documentation

- **Created `MIGRATION_TO_DENO.md`**:
  - Comprehensive migration guide
  - Development workflow documentation
  - Troubleshooting section
  - Testing instructions

- **Created `IMPORT_CONVERSION_GUIDE.md`**:
  - Detailed guide for converting imports
  - Explanation of conversion strategies
  - Code examples and patterns
  - Automated conversion script examples

- **Updated `README.md`**:
  - Added Development section with Deno instructions
  - Quick start guide for contributors
  - Build instructions

- **Updated `.gitignore`**:
  - Added Deno-specific ignores (`.deno/`)
  - Added `dist/` to ignore build outputs

## ⏳ Remaining Tasks

### Import Conversion

The TypeScript source files need their imports updated to be Deno-compatible. We've provided two approaches:

**Option A: Use the Import Map (Recommended)**
- The `deno.jsonc` already has import maps configured
- Only need to add `.ts` extensions to local imports
- Add `with { type: 'json' }` to JSON imports
- Run: `deno run -A scripts/convert-imports.ts`

**Option B: Manual Conversion**
- Convert to relative imports with `.ts` extensions
- More explicit but more work
- See `IMPORT_CONVERSION_GUIDE.md` for details

### Testing & Validation

After import conversion:

1. **Type check**: `deno check src/main.ts`
2. **Build**: `deno task build`
3. **Test in Obsidian**: Install the built plugin and test functionality
4. **Run tests**: `deno task test` (may need test updates)

### Optional Cleanup

- Remove `node_modules/` directory
- Consider removing `package.json` and `package-lock.json` (or keep for reference)
- Remove `tsconfig.json` (or keep for backward compatibility)
- Remove `ophidian.config.mjs`
- Update or remove old GitHub workflows (`verify.yml`, `release.yml`, etc.)

## 📋 Quick Start Guide

### For Development

1. Install Deno: https://deno.com/
2. Install VSCode Deno extension
3. Reload VSCode window
4. Run import conversion:
   ```bash
   deno run -A scripts/convert-imports.ts
   ```
5. Start development:
   ```bash
   $env:OBSIDIAN_TEST_VAULT = "C:\\path\\to\\vault"
   deno task dev
   ```

### For Building

Production build:
```bash
deno task build
```

The output will be in `./dist/` directory.

### For Testing

Run tests:
```bash
deno task test
```

Lint code:
```bash
deno task lint
```

Format code:
```bash
deno task fmt
```

## 🔧 Configuration Files Reference

| File | Purpose |
|------|---------|
| `deno.jsonc` | Main Deno configuration, tasks, import maps |
| `scripts/build.ts` | Build script (replaces ophidian.config.mjs) |
| `scripts/version-bump.ts` | Version management script |
| `scripts/convert-imports.ts` | Helper to convert imports |
| `.vscode/settings.json` | VSCode Deno integration |
| `.vscode/tasks.json` | VSCode build tasks |
| `.github/workflows/deno-ci.yml` | CI/CD for Deno |

## 🚀 Key Benefits of Deno Migration

1. **No `node_modules`**: Cleaner project, faster clones
2. **Built-in tooling**: No need for separate eslint, prettier, test runners
3. **Better security**: Explicit permissions model
4. **Faster development**: Built-in TypeScript support, no compilation step for development
5. **Modern standards**: Native ESM, web-compatible APIs
6. **Simpler setup**: Single runtime, fewer dependencies

## ⚠️ Important Notes

1. The import map approach maintains backward compatibility with the existing import structure
2. VSCode will show errors until the Deno extension is installed and enabled
3. The build output remains compatible with Obsidian's plugin system
4. npm packages are accessed via Deno's npm compatibility layer
5. All scripts use `-A` flag for permissions (consider restricting in production)

## 📚 Additional Resources

- [Deno Manual](https://deno.land/manual)
- [Deno by Example](https://examples.deno.land/)
- [Obsidian Plugin Development](https://docs.obsidian.md/Plugins)
- Reference implementations:
  - https://github.com/kuboon/obsidian-sample-plugin-deno
  - https://github.com/ras0q/obsidian-mobile-experience

## 🤝 Contributing

After this migration:

1. Contributors need Deno installed (not Node.js)
2. Use `deno task` instead of `npm run`
3. Imports must include `.ts` extensions
4. Follow Deno's formatting/linting standards

## 📝 License

This migration maintains the original MIT license of the project.

---

**Migration Status**: Infrastructure complete, import conversion pending

**Next Step**: Run `deno run -A scripts/convert-imports.ts` to convert imports
