const fs = require('fs');
const stringifyPackage = require('stringify-package');
const detectIndent = require('detect-indent');
const detectNewline = require('detect-newline');

module.exports.readVersion = function (contents) {
    const json = JSON.parse(contents);
    const versionKey = Object.keys(json)[Object.keys(json).length - 1];
    console.log(`ℹ Current Version: ${versionKey}`);
    return versionKey;
};

module.exports.writeVersion = function (contents, version) {
    // Pull version from manifest.
    let manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    const { minAppVersion } = manifest;
    console.log(`ℹ New Version: ${version}`);
    console.log(`ℹ Manifest Minimum Obsidian Version: ${minAppVersion}`);

    // Pull Obsidian version from package.json to validate.
    let package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const { obsidian } = package.devDependencies;
    console.log(`ℹ Package Minimum Obsidian Version: ${obsidian}`);

    if (minAppVersion !== obsidian) {
        console.error('⚠️  Manifest and Package Minimum Obsidian Versions do not match.');
        console.error('⚠️  Please update the manifest and package versions to match.');
        throw new Error('Manifest and Package Minimum Obsidian Versions do not match.');
    }

    const json = JSON.parse(contents);
    let indent = detectIndent(contents).indent;
    let newline = detectNewline(contents);
    json[version] = minAppVersion;
    return stringifyPackage(json, indent, newline);
};
