import type {TFile, TAbstractFile, CachedMetadata} from 'obsidian';

/**
 * Interface for abstracting Obsidian vault operations.
 * This allows for better testing and reduces direct dependency on Obsidian API.
 */
export interface IVaultAdapter {
  /**
   * Gets all markdown files in the vault.
   */
  getMarkdownFiles(): TFile[];

  /**
   * Gets a file by its path.
   */
  getAbstractFileByPath(path: string): TAbstractFile | null;

  /**
   * Reads a file from the vault with caching.
   */
  cachedRead(file: TFile): Promise<string>;

  /**
   * Reads a file from the vault.
   */
  read(file: TFile): Promise<string>;

  /**
   * Writes data to a file.
   */
  modify(file: TFile, data: string): Promise<void>;

  /**
   * Creates a new file.
   */
  create(path: string, data: string): Promise<TFile>;

  /**
   * Deletes a file.
   */
  delete(file: TAbstractFile): Promise<void>;

  /**
   * Renames a file.
   */
  rename(file: TAbstractFile, newPath: string): Promise<void>;

  /**
   * Processes the frontmatter of a file.
   */
  processFrontMatter(file: TFile, fn: (frontmatter: any) => void): Promise<void>;

  /**
   * Registers a callback for file creation events.
   */
  onCreateFile(callback: (file: TAbstractFile) => void): void;

  /**
   * Registers a callback for file deletion events.
   */
  onDeleteFile(callback: (file: TAbstractFile) => void): void;

  /**
   * Registers a callback for file modification events.
   */
  onModifyFile(callback: (file: TAbstractFile) => void): void;

  /**
   * Registers a callback for file rename events.
   */
  onRenameFile(callback: (file: TAbstractFile, oldPath: string) => void): void;
}
