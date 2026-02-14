/**
 * Interface for abstracting Obsidian workspace operations.
 * This allows for better testing and reduces direct dependency on Obsidian API.
 */
export interface IWorkspaceAdapter {
  /**
   * Triggers a custom event on the workspace.
   */
  trigger(name: string, ...data: any[]): void;

  /**
   * Registers a callback for when the layout is ready.
   */
  onLayoutReady(callback: () => void): void;

  /**
   * Registers a callback for a custom event.
   */
  on(name: string, callback: (...args: any[]) => void): void;

  /**
   * Gets the name of the current vault.
   */
  getVaultName(): string;
}
