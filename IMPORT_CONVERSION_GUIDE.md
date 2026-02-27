# Import Conversion Guide

This document explains how to convert the imports in the source files from Node.js/TypeScript style to Deno-compatible imports.

## Current State

The project uses TypeScript path mappings with `baseUrl: "./src"` in `tsconfig.json`. This means imports like:

```typescript
import {log} from 'lib/Logging';
import {Feature} from 'Settings/Feature';
```

Are resolved relative to the `src/` directory.

## Conversion Strategy

For Deno, we have two options:

### Option 1: Use Relative Imports (Recommended for Clarity)

Convert all imports to use relative paths with `.ts` extensions:

```typescript
// Before
import {log} from 'lib/Logging';
import {Feature} from 'Settings/Feature';

// After (from src/main.ts)
import {log} from './lib/Logging.ts';
import {Feature} from './Settings/Feature.ts';

// After (from src/Settings/SettingsTab.ts)
import {log} from '../lib/Logging.ts';
import {Feature} from './Feature.ts';
```

### Option 2: Use Deno Import Maps (Simpler but Less Explicit)

We can add path mappings to `deno.jsonc`:

```jsonc
{
  "imports": {
    "obsidian": "npm:obsidian@^1.7.2",
    // ... other npm packages
    
    // Local path mappings (matching the old baseUrl behavior)
    "lib/": "./src/lib/",
    "Settings/": "./src/Settings/",
    "Query/": "./src/Query/",
    "Render/": "./src/Render/",
    "Data/": "./src/Data/",
    "Integrations/": "./src/Integrations/",
    "Interfaces/": "./src/Interfaces/",
    "Parse/": "./src/Parse/",
    "PostRender/": "./src/PostRender/",
    "handlers/": "./src/handlers/",
    "UI/": "./src/UI/",
    "typings/": "./src/typings/"
  }
}
```

Then imports would change to:

```typescript
// Before
import {log} from 'lib/Logging';

// After
import {log} from 'lib/Logging.ts';
```

**Important:** Even with import maps, you MUST include the `.ts` extension.

## JSON Import Changes

JSON imports also need the extension and may need assertion:

```typescript
// Before
import alaSqlFunctions from 'UI/alaSqlFunctions.json';

// After (with import map)
import alaSqlFunctions from 'UI/alaSqlFunctions.json' with { type: 'json' };

// Or with relative path
import alaSqlFunctions from './UI/alaSqlFunctions.json' with { type: 'json' };
```

## NPM Package Imports

These are already handled by the imports section of `deno.jsonc`:

```typescript
// These work as-is
import {Plugin} from 'obsidian';
import Handlebars from 'handlebars';
import * as alasql from 'alasql';
```

## Automated Conversion Script

Here's a PowerShell script to help convert imports. Save as `convert-imports.ps1`:

\`\`\`powershell
# Find all TypeScript files
$files = Get-ChildItem -Path src -Filter *.ts -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Add .ts extension to local imports
    # This regex matches: from 'path' or from "path"
    # where path doesn't start with npm package names
    
    $content = $content -replace "from '([A-Z][^']*)'", "from '$1.ts'"
    $content = $content -replace 'from "([A-Z][^"]*)"', 'from "$1.ts"'
    
    # Add .json with assertion to JSON imports
    $content = $content -replace "from '([^']*\.json)'", "from '$1' with { type: 'json' }"
    $content = $content -replace 'from "([^"]*\.json)"', 'from "$1" with { type: "json" }'
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Import conversion complete!"
\`\`\`

## Manual Steps Required

1. **Review converted imports**: The script above is a starting point. You'll need to manually verify each file.

2. **Fix relative paths**: If using relative imports (Option 1), you'll need to calculate the correct relative path for each import based on the file's location.

3. **Test each module**: After conversion, test that each module loads correctly:
   ```bash
   deno check src/main.ts
   ```

4. **Update type definitions**: Check `src/typings/obsidian-ex.d.ts` and other `.d.ts` files for import syntax.

## Common Patterns to Convert

### Pattern 1: Service/Class Imports
```typescript
// Before
import {LoggingService} from 'lib/LoggingService';

// After (with import map)
import {LoggingService} from 'lib/LoggingService.ts';
```

### Pattern 2: Interface Imports
```typescript
// Before
import {type IRenderer} from 'Render/IRenderer';

// After (with import map)
import {type IRenderer} from 'Render/IRenderer.ts';
```

### Pattern 3: Barrel Exports
```typescript
// Before
import * as handlebarsHelpers from 'Render/HandlebarsHelpers';

// After (with import map)
import * as handlebarsHelpers from 'Render/HandlebarsHelpers/index.ts';
// OR if HandlebarsHelpers.ts is a file:
import * as handlebarsHelpers from 'Render/HandlebarsHelpers.ts';
```

## Verification

After making changes:

1. Run the type checker:
   ```bash
   deno check src/main.ts
   ```

2. Try to build:
   ```bash
   deno task build
   ```

3. Check for any remaining issues:
   ```bash
   deno lint
   ```

## Next Steps

After import conversion is complete:

1. Update any remaining Node.js-specific code (if any)
2. Test the build process thoroughly
3. Verify the plugin works in Obsidian
4. Update CI/CD workflows
5. Remove old Node.js configuration files (optional, can keep for reference)
