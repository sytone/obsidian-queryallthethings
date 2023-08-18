
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';
import {parse} from 'papaparse';

export interface IJsonLoaderSettings {
  jsonFiles: string;
}

export const JsonLoaderSettingsDefaults: IJsonLoaderSettings = {
  jsonFiles: '',
};

export class JsonLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.JsonLoaderService');
  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    JsonLoaderSettingsDefaults,
    async (settings: IJsonLoaderSettings) => {
      await this.settingsUpdateLoad(settings.jsonFiles);
    },
    async (settings: IJsonLoaderSettings) => {
      await this.settingsInitialLoad(settings.jsonFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(new SettingsTabHeading({text: 'JSON Loader Settings', level: 'h2', class: 'settings-heading'}));

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public importCallback = (content: string, tableName: string) => JSON.parse(content) as any[];
}
