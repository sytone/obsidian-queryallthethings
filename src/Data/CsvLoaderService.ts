
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';
import {parse} from 'papaparse';

/**
 * Interface representing the settings for loading CSV files.
 */
export interface ICsvLoaderSettings {
  csvFiles: string;
  csvLoaderSettingsOpen: boolean;

}

export const CsvLoaderSettingsDefaults: ICsvLoaderSettings = {
  csvFiles: '',
  csvLoaderSettingsOpen: false,
};

export class CsvLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.CsvLoaderService');
  settingsTab = useSettingsTab(this);
  csvLoaderSettingsOpen: boolean;

  settings = useSettings(
    this,
    CsvLoaderSettingsDefaults,
    async (settings: ICsvLoaderSettings) => {
      this.csvLoaderSettingsOpen = settings.csvLoaderSettingsOpen;
      await this.settingsUpdateLoad(settings.csvFiles);
    },
    async (settings: ICsvLoaderSettings) => {
      this.csvLoaderSettingsOpen = settings.csvLoaderSettingsOpen;
      await this.settingsInitialLoad(settings.csvFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.csvLoaderSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({open: this.csvLoaderSettingsOpen, text: 'CSV Loader Settings', level: 'h2', class: 'settings-heading'}), onToggle);

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

  /**
   * Asynchronously processes CSV content and returns the parsed data.
   *
   * @param content - The CSV content to be parsed.
   * @param tableName - The name of the table where the data will be imported.
   * @returns A promise that resolves to the parsed data.
   */
  public importCallback = async (content: string, tableName: string) => {
    const tr = parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return tr.data;
  };
}
