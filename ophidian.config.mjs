import fs from 'node:fs';
import Builder from '@ophidian/build';
import yaml from 'js-yaml';

// Transform YAML files to JSON so the editor menu will provide examples.
const yamlFiles = ['alaSqlFunctions', 'communityQueries', 'handlebarsHelpers'];

for (const file of yamlFiles) {
  const inputYML = `src/UI/${file}.yaml`;
  const outputJSON = `src/UI/${file}.json`;
  const object = yaml.load(fs.readFileSync(inputYML, {encoding: 'utf8'}));
  fs.writeFileSync(outputJSON, JSON.stringify(object, null, 2));
}

new Builder('src/main.ts') // <-- the path of your main module
  .withSass() // Could be omitted
  .withInstall() // Optional: publish to OBSIDIAN_TEST_VAULT on build
  .build();
