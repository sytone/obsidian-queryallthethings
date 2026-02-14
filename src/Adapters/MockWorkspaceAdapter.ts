import type {IWorkspaceAdapter} from './IWorkspaceAdapter';

/**
 * Mock implementation of IWorkspaceAdapter for testing.
 * Provides event simulation without Obsidian dependency.
 */
export class MockWorkspaceAdapter implements IWorkspaceAdapter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();
  private layoutReadyCallbacks: Array<() => void> = [];
  private layoutReadyCalled = false;

  trigger(name: string, ...data: any[]): void {
    const callbacks = this.events.get(name) ?? [];
    for (const callback of callbacks) {
      callback(...data);
    }
  }

  onLayoutReady(callback: () => void): void {
    this.layoutReadyCallbacks.push(callback);
    if (this.layoutReadyCalled) {
      callback();
    }
  }

  on(name: string, callback: (...args: any[]) => void): void {
    const callbacks = this.events.get(name) ?? [];
    callbacks.push(callback);
    this.events.set(name, callbacks);
  }

  getVaultName(): string {
    return 'test-vault';
  }

  /**
   * Simulates the layout ready event for testing.
   */
  triggerLayoutReady(): void {
    this.layoutReadyCalled = true;
    for (const callback of this.layoutReadyCallbacks) {
      callback();
    }
  }
}
