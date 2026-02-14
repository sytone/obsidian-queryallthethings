import type {App} from 'obsidian';
import type {IWorkspaceAdapter} from './IWorkspaceAdapter';

/**
 * Obsidian implementation of the IWorkspaceAdapter interface.
 * Wraps the Obsidian Workspace API to provide a consistent interface.
 */
export class ObsidianWorkspaceAdapter implements IWorkspaceAdapter {
  constructor(private readonly app: App) {}

  trigger(name: string, ...data: any[]): void {
    this.app.workspace.trigger(name, ...data);
  }

  onLayoutReady(callback: () => void): void {
    this.app.workspace.onLayoutReady(callback);
  }

  on(name: string, callback: (...args: any[]) => void): void {
    this.app.workspace.on(name, callback);
  }

  getVaultName(): string {
    return this.app.vault.getName();
  }
}
