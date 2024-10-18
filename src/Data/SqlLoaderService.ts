
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';
import {DataTables} from 'Data/DataTables';

export interface ISqlLoaderSettings {
  sqlFiles: string;
  sqlLoaderSettingsOpen: boolean;
}

export const JsonLoaderSettingsDefaults: ISqlLoaderSettings = {
  sqlFiles: '',
  sqlLoaderSettingsOpen: false,
};

export class SqlLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.SqlLoaderService');
  dataTables = this.use(DataTables);
  settingsTab = useSettingsTab(this);
  sqlLoaderSettingsOpen: boolean;

  settings = useSettings(
    this,
    JsonLoaderSettingsDefaults,
    async (settings: ISqlLoaderSettings) => {
      this.sqlLoaderSettingsOpen = settings.sqlLoaderSettingsOpen;
      await this.settingsUpdateLoad(settings.sqlFiles);
    },
    async (settings: ISqlLoaderSettings) => {
      this.sqlLoaderSettingsOpen = settings.sqlLoaderSettingsOpen;
      await this.settingsInitialLoad(settings.sqlFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.sqlLoaderSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({open: this.sqlLoaderSettingsOpen, text: 'SQL Loader Settings', level: 'h2', class: 'settings-heading'}), onToggle);

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.sqlFiles = value;
      });
    };

    const postRenderSetting = tab.addTextAreaInput(
      new SettingsTabField({
        name: 'SQL file to load on start',
        description: 'Add the files you want added on load, one per line. The SQL commands will be executed in order. Use a ";" to separate commands.',
        value: this.importFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  /**
   * Asynchronously executes an ad-hoc SQL query returns a empty array. This
   * is used to execute the SQL query in the settings. Unlike the other loaders
   * in the plugin, this one is not used to import data into a table.
   *
   * @param content - The SQL query to be executed.
   * @param tableName - The name of the table (currently unused).
   * @returns A promise that resolves to an empty array.
   */
  public importCallback = async (content: string, tableName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sqlQueryResult = await this.dataTables?.runAdhocQuery(content);
    this.logger.info('SQL query result', sqlQueryResult);
    return [];
  };
}
