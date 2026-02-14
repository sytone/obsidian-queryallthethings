import type {App, Plugin} from 'obsidian';
import type {IObsidianAdapter} from './IObsidianAdapter';
import {ObsidianVaultAdapter} from './ObsidianVaultAdapter';
import {ObsidianWorkspaceAdapter} from './ObsidianWorkspaceAdapter';
import {ObsidianMetadataCacheAdapter} from './ObsidianMetadataCacheAdapter';
import {ObsidianPluginAdapter} from './ObsidianPluginAdapter';

/**
 * Factory service for creating Obsidian adapters.
 * This centralizes the creation of all adapters with the Obsidian app instance.
 */
export class ObsidianAdapterFactory {
  /**
   * Creates a complete set of Obsidian adapters.
   * @param app - The Obsidian App instance
   * @param plugin - The plugin instance
   * @returns An object containing all Obsidian adapters
   */
  static createAdapters(app: App, plugin: Plugin): IObsidianAdapter {
    return {
      vault: new ObsidianVaultAdapter(app),
      workspace: new ObsidianWorkspaceAdapter(app),
      metadataCache: new ObsidianMetadataCacheAdapter(app),
      plugin: new ObsidianPluginAdapter(app, plugin),
    };
  }
}
