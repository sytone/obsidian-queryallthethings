
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';

export interface IMarkdownTableLoaderSettings {
  markdownTableFiles: string;
}

export const MarkdownTableLoaderSettingsDefaults: IMarkdownTableLoaderSettings = {
  markdownTableFiles: '',
};

export class MarkdownTableLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.MarkdownTableLoaderService');
  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    MarkdownTableLoaderSettingsDefaults,
    async (settings: IMarkdownTableLoaderSettings) => {
      await this.settingsUpdateLoad(settings.markdownTableFiles);
    },
    async (settings: IMarkdownTableLoaderSettings) => {
      await this.settingsInitialLoad(settings.markdownTableFiles);
    },
  );

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
        value: this.importFiles,
      }),
      onChange,
      settingsSection,
    );
  }

  public getFirstLineNumberWithContent(content: string): number {
    const lines = content.split('\n');
    let lineNumber = 0;
    for (const line of lines) {
      if (line.trim() !== '' && line.trim().startsWith('|')) {
        return lineNumber;
      }

      lineNumber++;
    }

    return lineNumber;
  }

  public importCallback = (content: string, tableName: string) => {
    // Get the first row with content and the pipe.
    const headerLine = this.getFirstLineNumberWithContent(content);
    const header = content.split('\n')[headerLine].split('|').filter(Boolean);
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
        const cellValue = tableColumns[index].trim();
        // Check to see if int.
        // eslint-disable-next-line no-self-compare, no-implicit-coercion
        if (+cellValue === +cellValue) {
          // eslint-disable-next-line no-implicit-coercion
          row[element.trim()] = +cellValue;
        } else {
          row[element.trim()] = cellValue;
        }
      }

      data.push(row);
    }

    return data;
  };
}
