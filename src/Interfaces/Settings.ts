import { FeatureFlag } from "Settings/Feature";

interface SettingsMap {
    [key: string]: string | boolean | number;
}

type HeadingState = {
    [id: string]: boolean;
};

/**
 * Logging options structure.
 *
 * @export
 * @interface LogOptions
 */
export interface LogOptions {
    minLevels: { [module: string]: string };
}

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
