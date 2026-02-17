import type {App, TFile, CachedMetadata} from 'obsidian';
import type {IMetadataCacheAdapter} from './IMetadataCacheAdapter';

/**
 * Obsidian implementation of the IMetadataCacheAdapter interface.
 * Wraps the Obsidian MetadataCache API to provide a consistent interface.
 */
export class ObsidianMetadataCacheAdapter implements IMetadataCacheAdapter {
  constructor(private readonly app: App) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  getFileCache(file: TFile): CachedMetadata | null {
    return this.app.metadataCache.getFileCache(file);
  }

  onMetadataChange(callback: (file: TFile, data: string, cache: CachedMetadata) => void): void {
    this.app.metadataCache.on('changed', callback);
  }

  on(name: string, callback: (...args: any[]) => void): void {
    this.app.metadataCache.on(name, callback);
  }
}
