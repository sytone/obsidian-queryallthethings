import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';
import { Settings } from 'Interfaces/Settings';
import { logging } from '../lib/logging';
import { Feature, FeatureFlag } from './Feature';

// Default data block that is stored in the data file.
const defaultSettings: Settings = {
  features: Feature.settingsFlags,
  generalSettings: {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,

    // Allows the filter to be pushed to the end of the tag. Available if APPEND_GLOBAL_FILTER feature enabled.
    appendGlobalFilter: false,

    defaultRenderTemplate: '',
    refreshDebounce: 2500,
    settingsVersion: 1,
    internalLoggingConsoleLogLimit: 10
  },
  headingOpened: {}, // ;  { 'Documentation and Support': true },
  loggingOptions: {
    minLevels: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '': 'info',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Qatt: 'info'
    }
  }
};

export class SettingsManager implements ISettingsManager {
  logger = logging.getLogger('Qatt.SettingsManager');

  settings: Settings;

  constructor (
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this.settings = defaultSettings;

    this.logger.info('Creating Settings Manager', this.settings);
    logging.configure({
      minLevels: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '': 'debug',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qatt: 'debug'
      }
    });
  }

  public updateSettings (newSettings: Partial<Settings>): Settings {
    this.logger.debug('updateSettings', newSettings);
    this.settings = { ...defaultSettings, ...newSettings };
    this.plugin.saveSettings();
    return this.getSettings();
  }

  public getSettings (): Settings {
    this.logger.debug('getSettings', { ...defaultSettings, ...this.settings });

    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
      if (this.settings.features[flag] === undefined) {
        this.settings.features[flag] = Feature.settingsFlags[flag];
      }
    }

    return { ...defaultSettings, ...this.settings };
  }

  public getValue (name: string): string | number | boolean {
    this.logger.debug(`getValue ${name}`);
    return this.settings.generalSettings[name];
  }

  public setValue (name: string, value: string | number | boolean): void {
    this.logger.debug(`setValue ${name} ${value}`);
    this.settings.generalSettings[name] = value;
    this.plugin.saveSettings();
  }

  public isFeatureEnabled (name: string): boolean {
    return this.settings.features[name] ?? false;
  }

  public toggleFeature (name: string, enabled: boolean): FeatureFlag {
    this.settings.features[name] = enabled;
    this.plugin.saveSettings();
    return this.settings.features;
  }
}
