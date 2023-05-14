import { FeatureFlag } from "Settings/Feature";
import { Settings } from 'Interfaces/Settings';

export interface ISettingsManager {
    getValue(name: string): string | boolean | number;
    setValue(name: string, value: string | boolean | number): void;
    isFeatureEnabled(name: string): boolean;
    toggleFeature(name: string, enabled: boolean): FeatureFlag;
    updateSettings(newSettings: Partial<Settings>): Settings;
    getSettings(): Settings
    settings: Settings;
}
