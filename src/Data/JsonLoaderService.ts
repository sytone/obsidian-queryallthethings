
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';

export interface IJsonLoaderSettings {
  jsonFiles: string;
  jsonLoaderSettingsOpen: boolean;

}

export const JsonLoaderSettingsDefaults: IJsonLoaderSettings = {
  jsonFiles: '',
  jsonLoaderSettingsOpen: false,
};

export class JsonLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.JsonLoaderService');
  settingsTab = useSettingsTab(this);
  jsonLoaderSettingsOpen: boolean;

  settings = useSettings(
    this,
    JsonLoaderSettingsDefaults,
    async (settings: IJsonLoaderSettings) => {
      this.jsonLoaderSettingsOpen = settings.jsonLoaderSettingsOpen;
      await this.settingsUpdateLoad(settings.jsonFiles);
    },
    async (settings: IJsonLoaderSettings) => {
      this.jsonLoaderSettingsOpen = settings.jsonLoaderSettingsOpen;
      await this.settingsInitialLoad(settings.jsonFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.jsonLoaderSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({open: this.jsonLoaderSettingsOpen, text: 'JSON Loader Settings', level: 'h2', class: 'settings-heading'}), onToggle);

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.jsonFiles = value;
      });
    };

    const postRenderSetting = tab.addTextAreaInput(
      new SettingsTabField({
        name: 'JSON file to load on start',
        description: 'Add the files you want added on load, one per line. The table name will be the name of the file minus the extension.',
        value: this.importFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  public importCallback = async (content: string, tableName: string) => {
    const data = JSON.parse(content) as any[];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  };
}
