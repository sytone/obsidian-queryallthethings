import {EventEmitter2} from 'eventemitter2';
import {type ISettingsManager} from 'Interfaces/ISettingsManager';
import {type ISettings} from 'Interfaces/Settings';
import {logging} from 'lib/Logging';
import {Feature, type FeatureFlag} from 'Settings/Feature';

// Default data block that is stored in the data file.
const defaultSettings: ISettings = {
  features: Feature.settingsFlags,
  generalSettings: {
    refreshDebounce: 2500,
    settingsVersion: 1,
    internalLoggingConsoleLogLimit: 10,
    postRenderFormat: 'micromark',
  },
  headingOpened: {}, // ;  { 'Documentation and Support': true },
  loggingOptions: {
    minLevels: {
      '': 'info',
      Qatt: 'info',
    },
  },
};

export class SettingsManager extends EventEmitter2 implements ISettingsManager {
  logger = logging.getLogger('Qatt.SettingsManager');

  settings: ISettings;

  constructor(
  ) {
    super();
    this.settings = defaultSettings;

    this.logger.info('Creating Settings Manager', this.settings);
    logging.configure({
      minLevels: {
        '': 'debug',
        Qatt: 'debug',
      },
    });
  }

  public updateSettings(newSettings: Partial<ISettings>): ISettings {
    this.logger.debug('updateSettings', newSettings);
    this.settings = {...defaultSettings, ...newSettings};
    this.emit('settings-updated', this.settings);
    return this.getSettings();
  }

  public getSettings(): ISettings {
    this.logger.debug('getSettings', {...defaultSettings, ...this.settings});

    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
      if (this.settings.features[flag] === undefined) {
        this.settings.features[flag] = Feature.settingsFlags[flag];
      }
    }

    return {...defaultSettings, ...this.settings};
  }

  public getValue(name: string): string | number | boolean {
    this.logger.debug(`getValue ${name}`);
    return this.settings.generalSettings[name];
  }

  public setValue(name: string, value: string | number | boolean): void {
    this.logger.debug(`setValue ${name} ${value as string}`);
    this.settings.generalSettings[name] = value;
    this.emit('settings-updated', this.settings);
  }

  public isFeatureEnabled(name: string): boolean {
    return this.settings.features[name] ?? false;
  }

  public toggleFeature(name: string, enabled: boolean): FeatureFlag {
    this.settings.features[name] = enabled;
    this.emit('settings-updated', this.settings);
    return this.settings.features;
  }

  public toggleDebug(): boolean {
    this.settings.loggingOptions.minLevels.Qatt = this.settings.loggingOptions.minLevels.Qatt === 'debug' ? 'info' : 'debug';
    this.emit('settings-updated', this.settings);
    return this.settings.loggingOptions.minLevels.Qatt === 'debug';
  }
}
