import type {IObsidianAdapter} from 'Adapters';
import {Service} from '@ophidian/core';

/**
 * Example service demonstrating the adapter pattern usage.
 * This service shows how to properly use adapters instead of direct Obsidian API calls.
 * 
 * @example
 * ```typescript
 * // In main.ts or service initialization
 * const adapters = ObsidianAdapterFactory.createAdapters(this.app, this);
 * const exampleService = new AdapterExampleService(adapters);
 * ```
 */
export class AdapterExampleService extends Service {
  constructor(private readonly adapters: IObsidianAdapter) {
    super();
  }

  /**
   * Example: Reading all markdown files
   * Before: this.plugin.app.vault.getMarkdownFiles()
   * After: this.adapters.vault.getMarkdownFiles()
   */
  async getAllMarkdownFiles() {
    return this.adapters.vault.getMarkdownFiles();
  }

  /**
   * Example: Reading file content
   * Before: await this.plugin.app.vault.cachedRead(file)
   * After: await this.adapters.vault.cachedRead(file)
   */
  async readFileContent(path: string) {
    const file = this.adapters.vault.getAbstractFileByPath(path);
    if (!file || !('stat' in file)) {
      throw new Error(`File not found: ${path}`);
    }

    return this.adapters.vault.cachedRead(file);
  }

  /**
   * Example: Triggering custom events
   * Before: this.plugin.app.workspace.trigger('custom-event', data)
   * After: this.adapters.workspace.trigger('custom-event', data)
   */
  notifyDataChanged(data: any) {
    this.adapters.workspace.trigger('qatt:data-changed', data);
  }

  /**
   * Example: Getting file metadata
   * Before: this.plugin.app.metadataCache.getFileCache(file)
   * After: this.adapters.metadataCache.getFileCache(file)
   */
  async getFileMetadata(path: string) {
    const file = this.adapters.vault.getAbstractFileByPath(path);
    if (!file || !('stat' in file)) {
      return null;
    }

    return this.adapters.metadataCache.getFileCache(file);
  }

  /**
   * Example: Checking if a plugin is enabled
   * Before: this.plugin.app.plugins.enabledPlugins.has('dataview')
   * After: this.adapters.plugin.isPluginEnabled('dataview')
   */
  isDataviewEnabled(): boolean {
    return this.adapters.plugin.isPluginEnabled('dataview');
  }

  /**
   * Example: Registering for file change events
   * Before: this.plugin.registerEvent(this.plugin.app.vault.on('modify', callback))
   * After: this.adapters.vault.onModifyFile(callback)
   */
  watchFileChanges(callback: (file: any) => void) {
    this.adapters.vault.onModifyFile(callback);
  }

  /**
   * Example: Waiting for layout ready
   * Before: this.plugin.app.workspace.onLayoutReady(callback)
   * After: this.adapters.workspace.onLayoutReady(callback)
   */
  onLayoutReady(callback: () => void) {
    this.adapters.workspace.onLayoutReady(callback);
  }

  /**
   * Complex example: Processing multiple files with metadata
   * This shows how adapters work together in a real-world scenario
   */
  async processAllNotesWithTag(tag: string) {
    const files = this.adapters.vault.getMarkdownFiles();
    const results = [];

    for (const file of files) {
      const metadata = this.adapters.metadataCache.getFileCache(file);
      if (metadata?.frontmatter?.tags?.includes(tag)) {
        const content = await this.adapters.vault.cachedRead(file);
        results.push({
          path: file.path,
          content,
          metadata,
        });
      }
    }

    // Notify that processing is complete
    this.adapters.workspace.trigger('qatt:notes-processed', {
      tag,
      count: results.length,
    });

    return results;
  }
}
