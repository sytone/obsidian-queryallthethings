# Deno Migration Checklist

Use this checklist to complete the migration from Node.js to Deno.

## ✅ Completed Steps

- [x] Created `deno.jsonc` with tasks, imports, and configuration
- [x] Created build script (`scripts/build.ts`)
- [x] Created version bump script (`scripts/version-bump.ts`)
- [x] Updated VSCode settings for Deno
- [x] Updated VSCode tasks to use Deno
- [x] Updated recommended extensions
- [x] Created GitHub Actions workflow for Deno
- [x] Updated README with Deno instructions
- [x] Created migration documentation
- [x] Created import conversion helpers
- [x] Updated `.gitignore` for Deno

## 📋 Next Steps (You Need to Do These)

### Step 1: Install Deno

```powershell
# Install Deno on Windows
irm https://deno.land/install.ps1 | iex
```

Or download from: https://deno.com/

### Step 2: Install VSCode Deno Extension

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Deno"
4. Install "Deno for VSCode" by Denoland
5. **Reload VSCode window** (Ctrl+Shift+P -> "Reload Window")

### Step 3: Convert Imports

Choose ONE of these methods:

**Method A: Using PowerShell Script (Easiest)**

```powershell
# From the project root
.\scripts\convert-imports.ps1
```

**Method B: Using Deno Script**

```powershell
deno run -A scripts/convert-imports.ts
```

**Method C: Manual Conversion**

Follow the guide in `IMPORT_CONVERSION_GUIDE.md`

### Step 4: Verify the Conversion

```powershell
# Check for TypeScript errors
deno check src/main.ts

# Review changes
git diff src/
```

### Step 5: Set Up Your Test Vault (Optional but Recommended)

```powershell
# Set environment variable for automatic deployment to test vault
$env:OBSIDIAN_TEST_VAULT = "C:\path\to\your\obsidian\vault"

# Or add to your PowerShell profile for persistence:
# notepad $PROFILE
# Add this line:
# $env:OBSIDIAN_TEST_VAULT = "C:\path\to\your\obsidian\vault"
```

### Step 6: Try Building

```powershell
# Development build with watch
deno task dev

# Or production build
deno task build
```

### Step 7: Test the Plugin

1. If you set `OBSIDIAN_TEST_VAULT`, the plugin is already in your vault
2. Otherwise, copy `dist/main.js`, `dist/manifest.json` to your vault's `.obsidian/plugins/qatt/`
3. Open Obsidian and enable the plugin
4. Test the plugin functionality

### Step 8: Run Tests (May Need Updates)

```powershell
# Run tests
deno task test

# If tests fail, they may need conversion to Deno test format
```

### Step 9: Code Quality Checks

```powershell
# Lint the code
deno task lint

# Format the code
deno task fmt
```

### Step 10: Commit Your Changes

```powershell
git add .
git commit -m "chore: migrate from Node.js to Deno"
git push
```

## 🔍 Troubleshooting

### VSCode Still Shows Errors

1. Make sure Deno extension is installed and enabled
2. Reload VSCode window (Ctrl+Shift+P -> "Reload Window")
3. Check that `deno.enable` is `true` in `.vscode/settings.json`
4. Make sure you're on the correct branch

### Import Errors

1. Make sure all local imports have `.ts` extension
2. Make sure JSON imports have `with { type: 'json' }`
3. Check that npm packages DON'T have `.ts` extension
4. Verify import maps in `deno.jsonc` are correct

### Build Fails

1. Check permissions: The script uses `-A` for all permissions
2. Make sure YAML files exist in `src/UI/`
3. Check that esbuild can access all dependencies
4. Review build output for specific errors

### Plugin Doesn't Work in Obsidian

1. Check browser console (Ctrl+Shift+I) for errors
2. Verify `main.js` was created in dist/
3. Check that `manifest.json` is valid
4. Ensure all dependencies are bundled correctly

## 📊 Progress Tracking

Current Status: **Infrastructure Complete - Ready for Import Conversion**

- [x] Deno configuration
- [x] Build system
- [x] VSCode integration  
- [x] Documentation
- [x] Helper scripts
- [ ] Import conversion (YOU DO THIS)
- [ ] Testing
- [ ] Deployment

## 🎯 Success Criteria

You know the migration is complete when:

1. ✅ `deno check src/main.ts` runs without errors
2. ✅ `deno task build` completes successfully
3. ✅ The plugin loads and works in Obsidian
4. ✅ All tests pass (or are updated to pass)
5. ✅ No TypeScript errors in VSCode with Deno extension

## 📚 Reference Documents

- `DENO_MIGRATION_SUMMARY.md` - Overview of what was done
- `MIGRATION_TO_DENO.md` - Detailed migration guide
- `IMPORT_CONVERSION_GUIDE.md` - Import conversion strategies
- `README.md` - Updated with Deno instructions

## 🆘 Need Help?

1. Review the reference implementations:
   - https://github.com/kuboon/obsidian-sample-plugin-deno
   - https://github.com/ras0q/obsidian-mobile-experience

2. Check Deno documentation:
   - https://deno.land/manual
   - https://examples.deno.land/

3. Review this project's documentation in the files listed above

## 🚀 After Migration

Optional cleanup tasks:

- [ ] Remove `node_modules/` directory
- [ ] Archive or remove `package.json` and `pnpm-lock.yaml`
- [ ] Archive or remove `tsconfig.json`
- [ ] Remove `ophidian.config.mjs`
- [ ] Update or remove old GitHub workflows
- [ ] Update CONTRIBUTING.md with Deno instructions

---

**Start Here**: Run `.\scripts\convert-imports.ps1` to begin!
