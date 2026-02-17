import type {App, Plugin} from 'obsidian';
import type {IObsidianAdapter} from './IObsidianAdapter.js';
import {ObsidianVaultAdapter} from './ObsidianVaultAdapter.js';
import {ObsidianWorkspaceAdapter} from './ObsidianWorkspaceAdapter.js';
import {ObsidianMetadataCacheAdapter} from './ObsidianMetadataCacheAdapter.js';
import {ObsidianPluginAdapter} from './ObsidianPluginAdapter.js';

/**
 * Creates a complete set of Obsidian adapters.
 * @param app - The Obsidian App instance
 * @param plugin - The plugin instance
 * @returns An object containing all Obsidian adapters
 */
export function createObsidianAdapters(app: App, plugin: Plugin): IObsidianAdapter {
  return {
    vault: new ObsidianVaultAdapter(app),
    workspace: new ObsidianWorkspaceAdapter(app),
    metadataCache: new ObsidianMetadataCacheAdapter(app),
    plugin: new ObsidianPluginAdapter(app, plugin),
  };
}
