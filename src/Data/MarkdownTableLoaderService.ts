
import {useSettings} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {BaseLoaderService} from 'Data/BaseLoaderService';

export interface IMarkdownTableLoaderSettings {
  markdownTableFiles: string;
  markdownLoaderSettingsOpen: boolean;
}

export const MarkdownTableLoaderSettingsDefaults: IMarkdownTableLoaderSettings = {
  markdownTableFiles: '',
  markdownLoaderSettingsOpen: false,
};

export class MarkdownTableLoaderService extends BaseLoaderService {
  logger = this.use(LoggingService).getLogger('Qatt.MarkdownTableLoaderService');
  settingsTab = useSettingsTab(this);
  markdownLoaderSettingsOpen: boolean;

  settings = useSettings(
    this,
    MarkdownTableLoaderSettingsDefaults,
    async (settings: IMarkdownTableLoaderSettings) => {
      this.markdownLoaderSettingsOpen = settings.markdownLoaderSettingsOpen;
      await this.settingsUpdateLoad(settings.markdownTableFiles);
    },
    async (settings: IMarkdownTableLoaderSettings) => {
      this.markdownLoaderSettingsOpen = settings.markdownLoaderSettingsOpen;
      await this.settingsInitialLoad(settings.markdownTableFiles);
    },
  );

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.markdownLoaderSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({open: this.markdownLoaderSettingsOpen, text: 'Markdown Table Loader Settings', level: 'h2', class: 'settings-heading'}), onToggle);

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

  /**
   * Retrieves the line number of the first line in the provided content that contains non-whitespace characters
   * and starts with a pipe ('|') character.
   *
   * @param content - The string content to be analyzed, typically representing the contents of a markdown file.
   * @returns The zero-based line number of the first line with content that starts with a pipe ('|') character.
   *          If no such line is found, returns the total number of lines in the content.
   */
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

  public importCallback = async (content: string, tableName: string) => {
    // Get the first row with content and the pipe.
    const headerLine = this.getFirstLineNumberWithContent(content);
    const header = content.split('\n')[headerLine].split('|').filter(Boolean).map(cell => cell.trim());
    const data = [];
    this.logger.info(`getFirstLineNumberWithContent ${headerLine}`, header);

    // Extract the table contents starting after the header line. Technically we could also
    // skip the second line but just incase something weird happens and there are no
    // break characters. '---' is the default break character in Obsidian tables.
    for (const line of content.split('\n').slice(headerLine + 1)) {
      if (line.trim().length === 0 || !line.trim().startsWith('|')) {
        // If there is a new line with no content we are at the end of the table.
        // If the line does not start with the pipe '|' then we are at the end of the table.
        break;
      }

      const tableColumns = line.split('|').filter(Boolean).map(cell => cell.trim());

      if (tableColumns.length !== header.length) {
        this.logger.error(`Table ${tableName} has a row with ${tableColumns.length} columns, but the header has ${header.length} columns.`, tableColumns);
        continue;
      }

      // Ignore the break between the header and the data.
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
