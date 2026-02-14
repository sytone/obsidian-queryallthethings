import type {App, TFile, TAbstractFile, EventRef} from 'obsidian';
import type {IVaultAdapter} from './IVaultAdapter';

/**
 * Obsidian implementation of the IVaultAdapter interface.
 * Wraps the Obsidian Vault API to provide a consistent interface.
 */
export class ObsidianVaultAdapter implements IVaultAdapter {
  constructor(private readonly app: App) {}

  getMarkdownFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles();
  }

  getAbstractFileByPath(path: string): TAbstractFile | null {
    return this.app.vault.getAbstractFileByPath(path);
  }

  async cachedRead(file: TFile): Promise<string> {
    return this.app.vault.cachedRead(file);
  }

  async read(file: TFile): Promise<string> {
    return this.app.vault.read(file);
  }

  async modify(file: TFile, data: string): Promise<void> {
    await this.app.vault.modify(file, data);
  }

  async create(path: string, data: string): Promise<TFile> {
    return this.app.vault.create(path, data);
  }

  async delete(file: TAbstractFile): Promise<void> {
    await this.app.vault.delete(file);
  }

  async rename(file: TAbstractFile, newPath: string): Promise<void> {
    await this.app.vault.rename(file, newPath);
  }

  async processFrontMatter(file: TFile, fn: (frontmatter: any) => void): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, fn);
  }

  onCreateFile(callback: (file: TAbstractFile) => void): void {
    this.app.vault.on('create', callback);
  }

  onDeleteFile(callback: (file: TAbstractFile) => void): void {
    this.app.vault.on('delete', callback);
  }

  onModifyFile(callback: (file: TAbstractFile) => void): void {
    this.app.vault.on('modify', callback);
  }

  onRenameFile(callback: (file: TAbstractFile, oldPath: string) => void): void {
    this.app.vault.on('rename', callback);
  }
}
