import type {TFile, CachedMetadata} from 'obsidian';

/**
 * Interface for abstracting Obsidian metadata cache operations.
 * This allows for better testing and reduces direct dependency on Obsidian API.
 */
export interface IMetadataCacheAdapter {
  /**
   * Gets the cached metadata for a file.
   */
  getFileCache(file: TFile): CachedMetadata | null;

  /**
   * Registers a callback for metadata changes.
   */
  onMetadataChange(callback: (file: TFile, data: string, cache: CachedMetadata) => void): void;

  /**
   * Registers a callback for a custom event on the metadata cache.
   */
  on(name: string, callback: (...args: any[]) => void): void;
}
