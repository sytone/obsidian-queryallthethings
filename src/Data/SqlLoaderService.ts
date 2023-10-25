
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';
import {DataTables} from 'Data/DataTables';

export interface ISqlLoaderSettings {
  sqlFiles: string;
}

export const JsonLoaderSettingsDefaults: ISqlLoaderSettings = {
  sqlFiles: '',
};

export class SqlLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.SqlLoaderService');
  dataTables = this.use(DataTables);

  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    JsonLoaderSettingsDefaults,
    async (settings: ISqlLoaderSettings) => {
      await this.settingsUpdateLoad(settings.sqlFiles);
    },
    async (settings: ISqlLoaderSettings) => {
      await this.settingsInitialLoad(settings.sqlFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(new SettingsTabHeading({text: 'SQL Loader Settings', level: 'h2', class: 'settings-heading'}));

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

  public importCallback = (content: string, tableName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sqlQueryResult = this.dataTables?.runAdhocQuery(content);
    this.logger.info('SQL query result', sqlQueryResult);
    return [];
  };
}
