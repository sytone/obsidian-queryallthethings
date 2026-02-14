// Interfaces
export {type IVaultAdapter} from './IVaultAdapter';
export {type IWorkspaceAdapter} from './IWorkspaceAdapter';
export {type IMetadataCacheAdapter} from './IMetadataCacheAdapter';
export {type IPluginAdapter} from './IPluginAdapter';
export {type IObsidianAdapter} from './IObsidianAdapter';

// Obsidian Implementations
export {ObsidianVaultAdapter} from './ObsidianVaultAdapter';
export {ObsidianWorkspaceAdapter} from './ObsidianWorkspaceAdapter';
export {ObsidianMetadataCacheAdapter} from './ObsidianMetadataCacheAdapter';
export {ObsidianPluginAdapter} from './ObsidianPluginAdapter';
export {ObsidianAdapterFactory} from './ObsidianAdapterFactory';

// Mock Implementations for Testing
export {MockVaultAdapter} from './MockVaultAdapter';
export {MockWorkspaceAdapter} from './MockWorkspaceAdapter';
export {MockMetadataCacheAdapter} from './MockMetadataCacheAdapter';
export {MockPluginAdapter} from './MockPluginAdapter';
