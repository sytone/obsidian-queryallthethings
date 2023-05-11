import { DayNumbers } from 'luxon';
import { LogOptions, log } from './../lib/logging';
import { Feature, FeatureFlag } from './Feature';

interface SettingsMap {
    [key: string]: string | boolean | number;
}

type HeadingState = {
    [id: string]: boolean;
};

export interface Settings {

    // Collection of feature flag IDs and their state.
    features: FeatureFlag;

    // Settings are moved to a more general map to allow the settings UI to be
    // dynamically generated.
    generalSettings: SettingsMap;

    // Tracks the stage of the headings in the settings UI.
    headingOpened: HeadingState;

    loggingOptions: LogOptions;
}

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
    },
    headingOpened: {}, //;  { 'Documentation and Support': true },
    loggingOptions: {
        minLevels: {
            '': 'info',
            'qatt': 'info',
        },
    },
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
        if (settings.features[flag] === undefined) {
            settings.features[flag] = Feature.settingsFlags[flag];
        }
    }

    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    log('debug', `updateSettings ${JSON.stringify(newSettings)}`);

    settings = { ...settings, ...newSettings };

    return getSettings();
};

export const updateGeneralSetting = (name: string, value: string | boolean): Settings => {
    settings.generalSettings[name] = value;

    // sync the old settings for the moment so a larger change is not needed.
    updateSettings({});

    return getSettings();
};

export const getGeneralSetting = (name: string): string | boolean | number => {
    return settings.generalSettings[name];
};

export const isFeatureEnabled = (internalName: string): boolean => {
    return settings.features[internalName] ?? false;
};

export const toggleFeature = (internalName: string, enabled: boolean): FeatureFlag => {
    settings.features[internalName] = enabled;
    return settings.features;
};
