# Obsidian Integration Adapters

This directory contains the adapter pattern implementation that abstracts the Obsidian API integration. This abstraction layer provides several key benefits:

## Benefits

1. **Better Testability**: Services can be tested with mock adapters without requiring a full Obsidian environment
2. **Reduced Coupling**: Direct dependencies on Obsidian API are isolated to adapter implementations
3. **Easier Maintenance**: When Obsidian API changes, only adapter implementations need to be updated
4. **Clearer Separation of Concerns**: Business logic is separated from platform-specific code

## Architecture

### Interfaces

The adapter pattern uses four core interfaces that define the contract for interacting with Obsidian:

- **`IVaultAdapter`**: Abstracts file system operations (read, write, create, delete, rename)
- **`IWorkspaceAdapter`**: Abstracts workspace events and UI operations
- **`IMetadataCacheAdapter`**: Abstracts metadata cache operations
- **`IPluginAdapter`**: Abstracts plugin lifecycle operations (commands, ribbon icons, etc.)
- **`IObsidianAdapter`**: Combined interface that provides all adapters together

### Implementations

#### Obsidian Implementations

These implementations wrap the actual Obsidian API:

- **`ObsidianVaultAdapter`**: Production implementation using `app.vault`
- **`ObsidianWorkspaceAdapter`**: Production implementation using `app.workspace`
- **`ObsidianMetadataCacheAdapter`**: Production implementation using `app.metadataCache`
- **`ObsidianPluginAdapter`**: Production implementation using plugin methods
- **`createObsidianAdapters`**: Factory to create all adapters with Obsidian app instance

#### Mock Implementations

These implementations provide in-memory simulation for testing:

- **`MockVaultAdapter`**: In-memory file system for testing
- **`MockWorkspaceAdapter`**: Event simulation for testing
- **`MockMetadataCacheAdapter`**: Metadata simulation for testing
- **`MockPluginAdapter`**: Plugin lifecycle simulation for testing

## Usage

### In Production Code

In the main plugin, create adapters using the factory:

```typescript
import {createObsidianAdapters} from 'Adapters';

class MyPlugin extends Plugin {
  async onload() {
    const adapters = createObsidianAdapters.createAdapters(this.app, this);
    
    // Pass adapters to services that need them
    this.myService = new MyService(adapters);
  }
}
```

### In Services

Services should accept adapters through their constructor or dependency injection:

```typescript
import type {IObsidianAdapter} from 'Adapters';

export class MyService {
  constructor(private readonly adapters: IObsidianAdapter) {}
  
  async doSomething() {
    // Use adapters instead of direct Obsidian API
    const files = this.adapters.vault.getMarkdownFiles();
    this.adapters.workspace.trigger('my-event', data);
  }
}
```

### In Tests

Use mock adapters to test services without Obsidian:

```typescript
import {MockVaultAdapter, MockWorkspaceAdapter, MockMetadataCacheAdapter, MockPluginAdapter} from 'Adapters';

describe('MyService', () => {
  it('should process files correctly', async () => {
    const vault = new MockVaultAdapter();
    const workspace = new MockWorkspaceAdapter();
    const metadataCache = new MockMetadataCacheAdapter();
    const plugin = new MockPluginAdapter();
    
    const adapters = {vault, workspace, metadataCache, plugin};
    const service = new MyService(adapters);
    
    // Add test data
    vault.addMockFile('test.md', '# Test');
    
    // Test service behavior
    await service.doSomething();
    
    // Verify results
    assert.strictEqual(vault.getMarkdownFiles().length, 1);
  });
});
```

## Migration Guide

When Obsidian updates its API, follow these steps:

1. **Update Interface**: If new methods are needed, add them to the appropriate interface
2. **Update Obsidian Implementation**: Update the corresponding Obsidian adapter implementation
3. **Update Mock Implementation**: Update the mock adapter to match the new interface
4. **Update Tests**: Add tests for the new functionality
5. **Update Services**: Services using the adapters should work without changes (if the interface is backward compatible)

## Best Practices

1. **Keep Adapters Thin**: Adapters should be simple wrappers with minimal logic
2. **Don't Skip the Adapter**: Always use adapters instead of direct Obsidian API calls
3. **Test with Mocks**: Use mock adapters for unit tests, use real adapters for integration tests
4. **Single Responsibility**: Each adapter focuses on one aspect of Obsidian integration
5. **Interface Stability**: Keep interfaces stable; prefer extending over modifying

## Example: Migrating Existing Code

### Before (Direct Obsidian API)

```typescript
export class NotesCacheService {
  async cacheFiles() {
    const files = this.plugin.app.vault.getMarkdownFiles();
    this.plugin.app.workspace.trigger('notes-cached');
  }
}
```

### After (Using Adapters)

```typescript
export class NotesCacheService {
  constructor(private readonly adapters: IObsidianAdapter) {}
  
  async cacheFiles() {
    const files = this.adapters.vault.getMarkdownFiles();
    this.adapters.workspace.trigger('notes-cached');
  }
}
```

This makes the service testable and isolates it from Obsidian API changes.
