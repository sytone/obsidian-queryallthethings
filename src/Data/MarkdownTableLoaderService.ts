
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import alasql from 'alasql';
import {Plugin, type TFile} from 'obsidian';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';

export interface IMarkdownTableLoaderSettings {
  markdownTableFiles: string;
}

export const MarkdownTableLoaderSettingsDefaults: IMarkdownTableLoaderSettings = {
  markdownTableFiles: '',
};

export class MarkdownTableLoaderService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.MarkdownTableLoaderService');
  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    MarkdownTableLoaderSettingsDefaults,
    (settings: IMarkdownTableLoaderSettings) => {
      this.logger.info('MarkdownTableLoaderService Updated Settings, restart to import CSV files.');
      this.markdownTableFiles = settings.markdownTableFiles;
    },
    async (settings: IMarkdownTableLoaderSettings) => {
      this.logger.info('MarkdownTableLoaderService Initialize Settings');
      this.markdownTableFiles = settings.markdownTableFiles ?? '';
      await this.importMarkdownTableFiles();
    },
  );

  markdownTableFiles: string;

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(new SettingsTabHeading({text: 'Markdown Table Loader Settings', level: 'h2', class: 'settings-heading'}));

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.markdownTableFiles = value;
      });
    };

    const postRenderSetting = tab.addTextAreaInput(
      new SettingsTabField({
        name: 'Markdown file to load on start',
        description: 'Add the files you want added on load, one per line. The table name will be the name of the file minus the extension. Only a markdown table should exist on the page.',
        value: this.markdownTableFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  public async importMarkdownTableFiles() {
    const markdownTableFiles = this.markdownTableFiles.split('\n').filter(Boolean) ?? [];

    this.logger.info('markdownTableFiles:', markdownTableFiles);

    for (const file of markdownTableFiles) {
      const vaultFile = this.plugin.app.vault.getAbstractFileByPath(file);
      const tableName = (vaultFile as TFile).basename;
      this.logger.info(`Loading ${file} as table ${(vaultFile as TFile).basename}:`);
      // eslint-disable-next-line no-await-in-loop
      const content = (await this.plugin.app.vault.cachedRead(vaultFile as TFile));

      // First row is header.
      const header = content.split('\n')[0].split('|').filter(Boolean);
      const data = [];

      for (const line of content.split('\n').slice(1)) {
        if (line.trim().length === 0) {
          continue;
        }

        const tableColumns = line.split('|').filter(Boolean);

        if (tableColumns.length !== header.length) {
          this.logger.error(`Table ${tableName} has a row with ${tableColumns.length} columns, but the header has ${header.length} columns.`);
          continue;
        }

        if (tableColumns[0].trim().startsWith('-')) {
          continue;
        }

        const row: Record<string, any> = {};

        for (const [index, element] of header.entries()) {
          row[element.trim()] = tableColumns[index].trim();
        }

        data.push(row);
      }

      this.logger.info(`Loaded Markdown Table: ${tableName}`, data);

      alasql(`DROP TABLE IF EXISTS ${tableName}`);
      alasql(`CREATE TABLE IF NOT EXISTS ${tableName}`);
      alasql.tables[tableName].data = data;

      const importedRowCount: number = alasql(`SELECT COUNT(*) AS ImportedRows FROM  ${tableName}`)[0].ImportedRows;
      this.logger.info(`Imported ${importedRowCount} rows to ${tableName}`);
    }
  }
}
