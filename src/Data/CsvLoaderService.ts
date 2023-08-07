
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import alasql from 'alasql';
import {Plugin, type TFile} from 'obsidian';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {parse} from 'papaparse';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';

export interface ICsvLoaderSettings {
  csvFiles: string;
}

export const CsvLoaderSettingsDefaults: ICsvLoaderSettings = {
  csvFiles: '',
};

export class CsvLoaderService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.CsvLoaderService');
  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    CsvLoaderSettingsDefaults,
    (settings: ICsvLoaderSettings) => {
      this.logger.info('CsvLoaderService Updated Settings, restart to import CSV files.');
      this.csvFiles = settings.csvFiles;
    },
    async (settings: ICsvLoaderSettings) => {
      this.logger.info('CsvLoaderService Initialize Settings');
      this.csvFiles = settings.csvFiles;
      await this.importCsvFiles();
    },
  );

  csvFiles: string;

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
        value: this.csvFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  public async importCsvFiles() {
    const csvFiles = this.csvFiles.split('\n').filter(Boolean) ?? [];

    for (const file of csvFiles) {
      const queryFile = this.plugin.app.vault.getAbstractFileByPath(file);
      const tableName = (queryFile as TFile).basename;
      this.logger.info(`Loading ${file} as table ${(queryFile as TFile).basename}:`);
      // eslint-disable-next-line no-await-in-loop
      const content = (await this.plugin.app.vault.cachedRead(queryFile as TFile));

      const tr = parse(content, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      this.logger.info(`Loaded CSV: ${tableName}`, tr);

      alasql(`DROP TABLE IF EXISTS ${tableName}`);
      alasql(`CREATE TABLE IF NOT EXISTS ${tableName}`);
      alasql.tables[tableName].data = tr.data;

      const importedRowCount: number = alasql(`SELECT COUNT(*) AS ImportedRows FROM  ${tableName}`)[0].ImportedRows;
      this.logger.info(`Imported ${importedRowCount} rows to ${tableName}`);
    }
  }
}
