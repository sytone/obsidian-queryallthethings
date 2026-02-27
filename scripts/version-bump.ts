import { parse } from 'https://deno.land/std@0.224.0/jsonc/mod.ts';

const versionType = Deno.args[0] as 'patch' | 'minor' | 'major' | undefined;

if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: deno task bump [patch|minor|major]');
  Deno.exit(1);
}

// Read manifest.json
const manifestText = await Deno.readTextFile('manifest.json');
const manifest = JSON.parse(manifestText);

// Parse current version
const [major, minor, patch] = manifest.version.split('.').map(Number);

// Calculate new version
let newVersion: string;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version from ${manifest.version} to ${newVersion}`);

// Update manifest.json
manifest.version = newVersion;
await Deno.writeTextFile('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('✓ Updated manifest.json');

// Update manifest-beta.json if it exists
try {
  const manifestBetaText = await Deno.readTextFile('manifest-beta.json');
  const manifestBeta = JSON.parse(manifestBetaText);
  manifestBeta.version = newVersion;
  await Deno.writeTextFile('manifest-beta.json', JSON.stringify(manifestBeta, null, 2) + '\n');
  console.log('✓ Updated manifest-beta.json');
} catch {
  // File doesn't exist, skip
}

// Update versions.json
try {
  const versionsText = await Deno.readTextFile('versions.json');
  const versions = JSON.parse(versionsText);
  versions[newVersion] = manifest.minAppVersion;
  await Deno.writeTextFile('versions.json', JSON.stringify(versions, null, 2) + '\n');
  console.log('✓ Updated versions.json');
} catch (error) {
  console.error('Error updating versions.json:', error);
}

// Update package.json if it exists (for compatibility)
try {
  const packageText = await Deno.readTextFile('package.json');
  const packageJson = JSON.parse(packageText);
  packageJson.version = newVersion;
  await Deno.writeTextFile('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✓ Updated package.json');
} catch {
  // File might not exist in pure Deno setup
}

console.log(`\n✨ Version bumped to ${newVersion}`);
console.log('Remember to:');
console.log('  1. Update CHANGELOG.md');
console.log('  2. Commit changes');
console.log('  3. Create a git tag and release');
