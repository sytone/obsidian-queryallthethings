/**
 * This script converts TypeScript imports to be Deno-compatible.
 * It adds .ts extensions to local imports and .json assertions to JSON imports.
 */

import { walk } from 'https://deno.land/std@0.224.0/fs/walk.ts';
import * as path from 'https://deno.land/std@0.224.0/path/mod.ts';

const srcDir = 'src';
let filesProcessed = 0;
let importsUpdated = 0;

console.log('Starting import conversion...\n');

// Packages that don't need .ts extension (from npm)
const npmPackages = [
  'obsidian',
  'alasql',
  'eventemitter2',
  'handlebars',
  'luxon',
  'mdast-util-from-markdown',
  'mdast-util-to-string',
  'mdast-util-wiki-link',
  'micromark',
  'micromark-extension-gfm',
  'micromark-extension-gfm-footnote',
  'micromark-extension-gfm-task-list-item',
  'micromark-extension-math',
  'micromark-extension-wiki-link',
  'micromark-util-combine-extensions',
  'micromark-util-types',
  'obsidian-dataview',
  'p-debounce',
  'papaparse',
  '@ophidian/core',
  '@codemirror/state',
  '@codemirror/view',
  '@preact/signals-core',
];

function isNpmPackage(importPath: string): boolean {
  return npmPackages.some(pkg => importPath === pkg || importPath.startsWith(pkg + '/'));
}

function needsConversion(importPath: string): boolean {
  // Don't convert if it's already a relative import with extension
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return false;
  }
  
  // Don't convert npm packages
  if (isNpmPackage(importPath)) {
    return false;
  }
  
  // Don't convert if it already has an extension
  if (importPath.endsWith('.ts') || importPath.endsWith('.js')) {
    return false;
  }
  
  // Convert JSON imports or local module imports
  return true;
}

async function convertFile(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  let updatedContent = content;
  let fileUpdated = false;

  // Pattern 1: Add .ts to local imports (from 'path' or from "path")
  // Matches: from 'Something' or from "Something" where Something doesn't start with . or @
  const importRegex = /from\s+(['"])([^'"]+)\1/g;
  
  updatedContent = updatedContent.replace(importRegex, (match, quote, importPath) => {
    if (needsConversion(importPath)) {
      fileUpdated = true;
      importsUpdated++;
      
      // If it's a JSON file, add the .json with type assertion
      if (importPath.endsWith('.json')) {
        return `from ${quote}${importPath}${quote} with { type: 'json' }`;
      }
      
      // Otherwise add .ts extension
      return `from ${quote}${importPath}.ts${quote}`;
    }
    return match;
  });

  // Pattern 2: Fix JSON imports that already have .json but need type assertion
  const jsonImportRegex = /from\s+(['"])([^'"]+\.json)\1(?!\s+with)/g;
  
  updatedContent = updatedContent.replace(jsonImportRegex, (match, quote, importPath) => {
    if (!match.includes('with { type:')) {
      fileUpdated = true;
      return `from ${quote}${importPath}${quote} with { type: 'json' }`;
    }
    return match;
  });

  if (fileUpdated) {
    await Deno.writeTextFile(filePath, updatedContent);
    console.log(`✓ Updated: ${filePath}`);
    filesProcessed++;
  }
}

// Process all TypeScript files
for await (const entry of walk(srcDir, { exts: ['.ts'] })) {
  if (entry.isFile && !entry.path.includes('node_modules')) {
    await convertFile(entry.path);
  }
}

console.log(`\n✨ Conversion complete!`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Imports updated: ${importsUpdated}`);
console.log(`\nNext steps:`);
console.log(`   1. Review the changes with: git diff`);
console.log(`   2. Check for type errors: deno check src/main.ts`);
console.log(`   3. Try building: deno task build`);
