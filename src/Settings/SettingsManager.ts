import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';
import { Settings } from 'Interfaces/Settings';
import { log, logging, logInfo } from '../lib/logging';
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
        internallogging_eventstoconsolelimit: 10,
    },
    headingOpened: {}, //;  { 'Documentation and Support': true },
    loggingOptions: {
        minLevels: {
            '': 'info',
            'qatt': 'info',
        },
    },
};

export class SettingsManager implements ISettingsManager {
    logger = logging.getLogger('Qatt.SettingsManager');

    settings: Settings = { ...defaultSettings };

    constructor(
        private plugin: IQueryAllTheThingsPlugin,
    ) {
        this.logger.info('Creating Settings Manager');
        logging.configure({
            minLevels: {
                '': 'debug',
                'qatt': 'debug',
            }
        });
    }

    public updateSettings(newSettings: Partial<Settings>): Settings {
        this.logger.debug(`updateSettings ${JSON.stringify(newSettings)}`);
        this.logger.debug(`updateSettings ${JSON.stringify(this.settings)}`);
        this.settings = { ...this.settings, ...newSettings };
        this.logger.debug(`updateSettings ${JSON.stringify(this.settings)}`);
        this.plugin.saveSettings();
        return this.getSettings();
    }
    public getSettings(): Settings {
        // Check to see if there is a new flag and if so add it to the users settings.
        for (const flag in Feature.settingsFlags) {
            if (this.settings.features[flag] === undefined) {
                this.settings.features[flag] = Feature.settingsFlags[flag];
            }
        }

        return { ...this.settings };
    }
    public getValue(name: string): string | number | boolean {
        this.logger.debug(`getValue ${name}`);
        return this.settings.generalSettings[name];
    }
    public setValue(name: string, value: string | number | boolean): void {
        this.logger.debug(`setValue ${name} ${value}`);
        this.settings.generalSettings[name] = value;
        this.plugin.saveSettings();
    }
    public isFeatureEnabled(name: string): boolean {
        return this.settings.features[name] ?? false;
    }
    public toggleFeature(name: string, enabled: boolean): FeatureFlag {
        this.settings.features[name] = enabled;
        this.plugin.saveSettings();
        return this.settings.features;
    }

}

