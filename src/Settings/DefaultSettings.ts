import {type ISettings} from 'Interfaces/Settings';
import {Feature} from 'Settings/Feature';

// Default data block that is stored in the data file.
// export const DefaultSettings: ISettings = {
//   features: Feature.settingsFlags,
//   generalSettings: {
//     refreshDebounce: 2500,
//     settingsVersion: 1,
//     internalLoggingConsoleLogLimit: 10,
//     postRenderFormat: 'micromark',
//   },
//   headingOpened: {}, // ;  { 'Documentation and Support': true },
//   loggingOptions: {
//     minLevels: {
//       '': 'info',
//       Qatt: 'info',
//     },
//   },
// };

export interface IPluginSettings {
  onStartSqlQueries: string;
}

export const PluginSettingsDefaults: IPluginSettings = {
  onStartSqlQueries: 'SELECT * FROM sqlite_master;',
};
