import {type FeatureFlag} from 'Settings/Feature';

type SettingsMap = Record<string, string | boolean | number>;

type HeadingState = Record<string, boolean>;

/**
 * Logging options structure.
 *
 * @export
 * @interface ILogOptions
 */
export interface ILogOptions {
  minLevels: Record<string, string>;
}

export interface ISettings {

  // Collection of feature flag IDs and their state.
  features: FeatureFlag;

  // Settings are moved to a more general map to allow the settings UI to be
  // dynamically generated.
  generalSettings: SettingsMap;

  // Tracks the stage of the headings in the settings UI.
  headingOpened: HeadingState;

  loggingOptions: ILogOptions;
}
