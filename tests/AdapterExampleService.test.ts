/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {AdapterExampleService} from '../src/Adapters/AdapterExampleService.js';
import {MockVaultAdapter, MockWorkspaceAdapter, MockMetadataCacheAdapter, MockPluginAdapter} from '../src/Adapters/index.js';

describe('AdapterExampleService', () => {
  function createService() {
    const vault = new MockVaultAdapter();
    const workspace = new MockWorkspaceAdapter();
    const metadataCache = new MockMetadataCacheAdapter();
    const plugin = new MockPluginAdapter();

    const adapters = {vault, workspace, metadataCache, plugin};
    const service = new AdapterExampleService(adapters);

    return {service, vault, workspace, metadataCache, plugin};
  }

  it('should get all markdown files', async () => {
    const {service, vault} = createService();

    vault.addMockFile('note1.md', '# Note 1');
    vault.addMockFile('note2.md', '# Note 2');

    const files = await service.getAllMarkdownFiles();

    assert.strictEqual(files.length, 2);
    assert.strictEqual(files[0].path, 'note1.md');
    assert.strictEqual(files[1].path, 'note2.md');
  });

  it('should read file content', async () => {
    const {service, vault} = createService();

    vault.addMockFile('test.md', '# Test Content');

    const content = await service.readFileContent('test.md');

    assert.strictEqual(content, '# Test Content');
  });

  it('should throw error for non-existent file', async () => {
    const {service} = createService();

    await assert.rejects(
      async () => service.readFileContent('nonexistent.md'),
      {message: 'File not found: nonexistent.md'},
    );
  });

  it('should notify data changed', () => {
    const {service, workspace} = createService();
    let eventData: any = null;

    workspace.on('qatt:data-changed', (data: any) => {
      eventData = data;
    });

    service.notifyDataChanged({test: 'data'});

    assert.deepStrictEqual(eventData, {test: 'data'});
  });

  it('should get file metadata', async () => {
    const {service, vault, metadataCache} = createService();

    const file = vault.addMockFile('test.md', '# Test');
    const mockMetadata = {frontmatter: {title: 'Test Note'}};
    metadataCache.addMockMetadata('test.md', mockMetadata as any);

    const metadata = await service.getFileMetadata('test.md');

    assert.deepStrictEqual(metadata, mockMetadata);
  });

  it('should check if dataview is enabled', () => {
    const {service, plugin} = createService();

    assert.strictEqual(service.isDataviewEnabled(), true);

    plugin.setPluginEnabled('dataview', false);

    assert.strictEqual(service.isDataviewEnabled(), false);
  });

  it('should watch file changes', () => {
    const {service, vault} = createService();
    let changedFile: any = null;

    service.watchFileChanges(file => {
      changedFile = file;
    });

    const file = vault.addMockFile('test.md', '# Test');
    vault.triggerModify(file);

    assert.strictEqual(changedFile?.path, 'test.md');
  });

  it('should call layout ready callback', () => {
    const {service, workspace} = createService();
    let layoutReady = false;

    service.onLayoutReady(() => {
      layoutReady = true;
    });

    workspace.triggerLayoutReady();

    assert.strictEqual(layoutReady, true);
  });

  it('should process notes with specific tag', async () => {
    const {service, vault, metadataCache, workspace} = createService();

    // Add files with different tags
    const file1 = vault.addMockFile('note1.md', '# Note 1');
    const file2 = vault.addMockFile('note2.md', '# Note 2');
    const file3 = vault.addMockFile('note3.md', '# Note 3');

    metadataCache.addMockMetadata('note1.md', {
      frontmatter: {tags: ['important', 'work']},
    } as any);

    metadataCache.addMockMetadata('note2.md', {
      frontmatter: {tags: ['personal']},
    } as any);

    metadataCache.addMockMetadata('note3.md', {
      frontmatter: {tags: ['important', 'personal']},
    } as any);

    let eventTriggered = false;
    let eventData: any = null;

    workspace.on('qatt:notes-processed', (data: any) => {
      eventTriggered = true;
      eventData = data;
    });

    const results = await service.processAllNotesWithTag('important');

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].path, 'note1.md');
    assert.strictEqual(results[1].path, 'note3.md');
    assert.strictEqual(eventTriggered, true);
    assert.strictEqual(eventData.tag, 'important');
    assert.strictEqual(eventData.count, 2);
  });

  it('should handle files without metadata', async () => {
    const {service, vault, metadataCache} = createService();

    vault.addMockFile('note1.md', '# Note 1');

    const results = await service.processAllNotesWithTag('important');

    assert.strictEqual(results.length, 0);
  });
});
