import type {TFile, TAbstractFile} from 'obsidian';
import type {IVaultAdapter} from './IVaultAdapter';

/**
 * Mock implementation of IVaultAdapter for testing.
 * Provides an in-memory file system simulation.
 */
export class MockVaultAdapter implements IVaultAdapter {
  private readonly files = new Map<string, {file: TFile; content: string}>();
  private readonly createCallbacks: Array<(file: TAbstractFile) => void> = [];
  private readonly deleteCallbacks: Array<(file: TAbstractFile) => void> = [];
  private readonly modifyCallbacks: Array<(file: TAbstractFile) => void> = [];
  private readonly renameCallbacks: Array<(file: TAbstractFile, oldPath: string) => void> = [];

  /**
   * Adds a mock file to the vault for testing.
   */
  addMockFile(path: string, content: string): TFile {
    const mockFile = {
      path,
      name: path.split('/').pop() ?? path,
      basename: path.split('/').pop()?.replace(/\.md$/, '') ?? path,
      extension: 'md',
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: content.length,
      },
    };

    this.files.set(path, {file: mockFile as TFile, content});
    return mockFile as TFile;
  }

  getMarkdownFiles(): TFile[] {
    return Array.from(this.files.values()).map(f => f.file);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getAbstractFileByPath(path: string): TAbstractFile | null {
    return this.files.get(path)?.file ?? null;
  }

  async cachedRead(file: TFile): Promise<string> {
    return this.read(file);
  }

  async read(file: TFile): Promise<string> {
    const content = this.files.get(file.path)?.content;
    if (content === undefined) {
      throw new Error(`File not found: ${file.path}`);
    }

    return content;
  }

  async modify(file: TFile, data: string): Promise<void> {
    const existing = this.files.get(file.path);
    if (!existing) {
      throw new Error(`File not found: ${file.path}`);
    }

    this.files.set(file.path, {file: existing.file, content: data});
    for (const callback of this.modifyCallbacks) {
      callback(file);
    }
  }

  async create(path: string, data: string): Promise<TFile> {
    if (this.files.has(path)) {
      throw new Error(`File already exists: ${path}`);
    }

    const file = this.addMockFile(path, data);
    for (const callback of this.createCallbacks) {
      callback(file);
    }

    return file;
  }

  async delete(file: TAbstractFile): Promise<void> {
    this.files.delete(file.path);
    for (const callback of this.deleteCallbacks) {
      callback(file);
    }
  }

  async rename(file: TAbstractFile, newPath: string): Promise<void> {
    const existing = this.files.get(file.path);
    if (!existing) {
      throw new Error(`File not found: ${file.path}`);
    }

    const oldPath = file.path;
    this.files.delete(file.path);
    const newFile = {
      ...existing.file,
      path: newPath,
      name: newPath.split('/').pop() ?? newPath,
      basename: newPath.split('/').pop()?.replace(/\.md$/, '') ?? newPath,
    };
    this.files.set(newPath, {file: newFile, content: existing.content});

    for (const callback of this.renameCallbacks) {
      callback(newFile, oldPath);
    }
  }

  async processFrontMatter(file: TFile, fn: (frontmatter: any) => void): Promise<void> {
    // Simplified mock implementation
    const frontmatter = {};
    fn(frontmatter);
  }

  onCreateFile(callback: (file: TAbstractFile) => void): void {
    this.createCallbacks.push(callback);
  }

  onDeleteFile(callback: (file: TAbstractFile) => void): void {
    this.deleteCallbacks.push(callback);
  }

  onModifyFile(callback: (file: TAbstractFile) => void): void {
    this.modifyCallbacks.push(callback);
  }

  onRenameFile(callback: (file: TAbstractFile, oldPath: string) => void): void {
    this.renameCallbacks.push(callback);
  }

  /**
   * Triggers file creation callbacks manually for testing.
   */
  triggerCreate(file: TFile): void {
    for (const callback of this.createCallbacks) {
      callback(file);
    }
  }

  /**
   * Triggers file deletion callbacks manually for testing.
   */
  triggerDelete(file: TFile): void {
    for (const callback of this.deleteCallbacks) {
      callback(file);
    }
  }

  /**
   * Triggers file modification callbacks manually for testing.
   */
  triggerModify(file: TFile): void {
    for (const callback of this.modifyCallbacks) {
      callback(file);
    }
  }

  /**
   * Triggers file rename callbacks manually for testing.
   */
  triggerRename(file: TFile, oldPath: string): void {
    for (const callback of this.renameCallbacks) {
      callback(file, oldPath);
    }
  }
}
