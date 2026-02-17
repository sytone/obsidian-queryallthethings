/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {describe, it} from 'node:test';
import assert from 'node:assert';
import {MockVaultAdapter, MockWorkspaceAdapter, MockMetadataCacheAdapter, MockPluginAdapter} from '../src/Adapters/index.js';

describe('Mock Adapters', () => {
  it('MockVaultAdapter should create and read files', async () => {
    const adapter = new MockVaultAdapter();
    const file = adapter.addMockFile('test.md', '# Test Content');

    assert.strictEqual(file.path, 'test.md');
    assert.strictEqual(file.name, 'test.md');

    const content = await adapter.read(file);
    assert.strictEqual(content, '# Test Content');
  });

  it('MockVaultAdapter should trigger file creation events', async () => {
    const adapter = new MockVaultAdapter();
    let eventTriggered = false;

    adapter.onCreateFile(file => {
      eventTriggered = true;
      assert.strictEqual(file.path, 'new-file.md');
    });

    await adapter.create('new-file.md', 'content');
    assert.strictEqual(eventTriggered, true);
  });

  it('MockWorkspaceAdapter should trigger custom events', () => {
    const adapter = new MockWorkspaceAdapter();
    let eventData = '';

    adapter.on('test-event', (data: string) => {
      eventData = data;
    });

    adapter.trigger('test-event', 'test-data');
    assert.strictEqual(eventData, 'test-data');
  });

  it('MockWorkspaceAdapter should call onLayoutReady callbacks', () => {
    const adapter = new MockWorkspaceAdapter();
    let layoutReady = false;

    adapter.onLayoutReady(() => {
      layoutReady = true;
    });

    adapter.triggerLayoutReady();
    assert.strictEqual(layoutReady, true);
  });

  it('MockMetadataCacheAdapter should store and retrieve metadata', () => {
    const adapter = new MockMetadataCacheAdapter();
    const mockFile = {path: 'test.md'} as any;
    const metadata = {frontmatter: {title: 'Test'}};

    adapter.addMockMetadata('test.md', metadata as any);

    const retrieved = adapter.getFileCache(mockFile);
    assert.deepStrictEqual(retrieved, metadata);
  });

  it('MockPluginAdapter should track registered commands', () => {
    const adapter = new MockPluginAdapter();
    const command = {
      id: 'test-command',
      name: 'Test Command',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      callback() {},
    };

    adapter.addCommand(command);

    const commands = adapter.getRegisteredCommands();
    assert.strictEqual(commands.length, 1);
    assert.strictEqual(commands[0].id, 'test-command');
  });

  it('MockPluginAdapter should check plugin enabled status', () => {
    const adapter = new MockPluginAdapter();

    assert.strictEqual(adapter.isPluginEnabled('dataview'), true);
    assert.strictEqual(adapter.isPluginEnabled('nonexistent'), false);

    adapter.setPluginEnabled('test-plugin', true);
    assert.strictEqual(adapter.isPluginEnabled('test-plugin'), true);
  });
});
