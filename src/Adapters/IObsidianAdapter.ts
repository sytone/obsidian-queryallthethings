import type {IVaultAdapter} from './IVaultAdapter';
import type {IWorkspaceAdapter} from './IWorkspaceAdapter';
import type {IMetadataCacheAdapter} from './IMetadataCacheAdapter';
import type {IPluginAdapter} from './IPluginAdapter';

/**
 * Combined adapter interface that provides all Obsidian adapters.
 * This makes it easier to inject all adapters into services that need them.
 */
export interface IObsidianAdapter {
  vault: IVaultAdapter;
  workspace: IWorkspaceAdapter;
  metadataCache: IMetadataCacheAdapter;
  plugin: IPluginAdapter;
}
