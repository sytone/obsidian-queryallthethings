
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';
import {parse} from 'papaparse';

export interface ICsvLoaderSettings {
  csvFiles: string;
}

export const CsvLoaderSettingsDefaults: ICsvLoaderSettings = {
  csvFiles: '',
};

export class CsvLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.CsvLoaderService');
  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    CsvLoaderSettingsDefaults,
    async (settings: ICsvLoaderSettings) => {
      await this.settingsUpdateLoad(settings.csvFiles);
    },
    async (settings: ICsvLoaderSettings) => {
      await this.settingsInitialLoad(settings.csvFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(new SettingsTabHeading({text: 'CSV Loader Settings', level: 'h2', class: 'settings-heading'}));

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.csvFiles = value;
      });
    };

    const postRenderSetting = tab.addTextAreaInput(
      new SettingsTabField({
        name: 'CSV file to load on start',
        description: 'Add the files you want added on load, one per line. The table name will be the name of the file minus the extension.',
        value: this.importFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  public importCallback = (content: string, tableName: string) => {
    const tr = parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return tr.data;
  };
}