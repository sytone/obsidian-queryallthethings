// Interfaces
export {type IVaultAdapter} from './IVaultAdapter.js';
export {type IWorkspaceAdapter} from './IWorkspaceAdapter.js';
export {type IMetadataCacheAdapter} from './IMetadataCacheAdapter.js';
export {type IPluginAdapter} from './IPluginAdapter.js';
export {type IObsidianAdapter} from './IObsidianAdapter.js';

// Obsidian Implementations
export {ObsidianVaultAdapter} from './ObsidianVaultAdapter.js';
export {ObsidianWorkspaceAdapter} from './ObsidianWorkspaceAdapter.js';
export {ObsidianMetadataCacheAdapter} from './ObsidianMetadataCacheAdapter.js';
export {ObsidianPluginAdapter} from './ObsidianPluginAdapter.js';
export {createObsidianAdapters} from './ObsidianAdapterFactory.js';

// Mock Implementations for Testing
export {MockVaultAdapter} from './MockVaultAdapter.js';
export {MockWorkspaceAdapter} from './MockWorkspaceAdapter.js';
export {MockMetadataCacheAdapter} from './MockMetadataCacheAdapter.js';
export {MockPluginAdapter} from './MockPluginAdapter.js';
