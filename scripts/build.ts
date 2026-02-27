import * as esbuild from 'esbuild';
import * as path from 'https://deno.land/std@0.224.0/path/mod.ts';
import * as yaml from 'js-yaml';

const args = Deno.args;
const isProduction = args.includes('production');
const isDev = args.includes('dev');

// Transform YAML files to JSON so the editor menu will provide examples.
const yamlFiles = ['alaSqlFunctions', 'communityQueries', 'handlebarsHelpers'];

console.log('Converting YAML files to JSON...');
for (const file of yamlFiles) {
  const inputYML = `src/UI/${file}.yaml`;
  const outputJSON = `src/UI/${file}.json`;
  
  try {
    const yamlContent = await Deno.readTextFile(inputYML);
    const object = yaml.load(yamlContent);
    await Deno.writeTextFile(outputJSON, JSON.stringify(object, null, 2));
    console.log(`  ✓ Converted ${inputYML} -> ${outputJSON}`);
  } catch (error) {
    console.error(`  ✗ Error converting ${inputYML}:`, error);
  }
}

// Get the test vault path from environment variable
const testVault = Deno.env.get('OBSIDIAN_TEST_VAULT');
const outdir = testVault 
  ? path.join(testVault, '.obsidian', 'plugins', 'qatt')
  : './dist';

console.log(`\nBuilding plugin...`);
console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
console.log(`Output directory: ${outdir}`);

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: isProduction ? false : 'inline',
  treeShaking: true,
  outfile: path.join(outdir, 'main.js'),
  minify: isProduction,
  platform: 'node',
  define: {
    'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
  },
});

if (isDev) {
  console.log('\n👀 Watching for changes...\n');
  await context.watch();
  
  // Keep the process running
  await new Promise(() => {});
} else {
  await context.rebuild();
  await context.dispose();
  
  // Copy manifest and styles to output directory
  if (testVault || isProduction) {
    console.log('\nCopying manifest and styles...');
    try {
      await Deno.copyFile('manifest.json', path.join(outdir, 'manifest.json'));
      console.log('  ✓ Copied manifest.json');
    } catch (error) {
      console.error('  ✗ Error copying manifest.json:', error);
    }
    
    try {
      await Deno.copyFile('styles.css', path.join(outdir, 'styles.css'));
      console.log('  ✓ Copied styles.css');
    } catch (error) {
      // styles.css might not exist, that's okay
      if (error instanceof Deno.errors.NotFound) {
        console.log('  ℹ styles.css not found, skipping');
      } else {
        console.error('  ✗ Error copying styles.css:', error);
      }
    }
  }
  
  console.log('\n✨ Build complete!\n');
}
