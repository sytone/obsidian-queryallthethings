// eslint-disable-next-line @typescript-eslint/naming-convention
import Builder from '@ophidian/build';

new Builder('src/main.ts') // <-- the path of your main module
  .withSass() // Could be omitted
  .withInstall() // Optional: publish to OBSIDIAN_TEST_VAULT on build
  .build();
