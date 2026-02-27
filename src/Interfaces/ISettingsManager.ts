import {type FeatureFlag} from 'Settings/Feature.ts';
import {type ISettings} from 'Interfaces/Settings.ts';

export interface ISettingsManager {
  settings: ISettings;
  getValue(name: string): string | boolean | number;
  setValue(name: string, value: string | boolean | number): void;
  isFeatureEnabled(name: string): boolean;
  toggleFeature(name: string, enabled: boolean): FeatureFlag;
  updateSettings(newSettings: Partial<ISettings>): ISettings;
  getSettings(): ISettings;
  toggleDebug(): boolean;
}
