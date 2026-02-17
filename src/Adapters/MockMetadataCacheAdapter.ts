import type {TFile, CachedMetadata} from 'obsidian';
import type {IMetadataCacheAdapter} from './IMetadataCacheAdapter';

/**
 * Mock implementation of IMetadataCacheAdapter for testing.
 * Provides metadata cache simulation without Obsidian dependency.
 */
export class MockMetadataCacheAdapter implements IMetadataCacheAdapter {
  private readonly cache = new Map<string, CachedMetadata>();
  private readonly changeCallbacks: Array<(file: TFile, data: string, cache: CachedMetadata) => void> = [];
  private readonly events = new Map<string, Array<(...args: any[]) => void>>();

  /**
   * Adds mock metadata for a file path.
   */
  addMockMetadata(path: string, metadata: CachedMetadata): void {
    this.cache.set(path, metadata);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getFileCache(file: TFile): CachedMetadata | null {
    return this.cache.get(file.path) ?? null;
  }

  onMetadataChange(callback: (file: TFile, data: string, cache: CachedMetadata) => void): void {
    this.changeCallbacks.push(callback);
  }

  on(name: string, callback: (...args: any[]) => void): void {
    const callbacks = this.events.get(name) ?? [];
    callbacks.push(callback);
    this.events.set(name, callbacks);
  }

  /**
   * Triggers metadata change callbacks for testing.
   */
  triggerMetadataChange(file: TFile, data: string, cache: CachedMetadata): void {
    this.cache.set(file.path, cache);
    for (const callback of this.changeCallbacks) {
      callback(file, data, cache);
    }
  }

  /**
   * Triggers custom events for testing.
   */
  triggerEvent(name: string, ...args: any[]): void {
    const callbacks = this.events.get(name) ?? [];
    for (const callback of callbacks) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      callback(...args);
    }
  }
}
