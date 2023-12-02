import {Plugin, type TFile} from 'obsidian';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import alasql from 'alasql';

type GetDataArrayFromFileCallback = (content: string, tableName: string, settings: string) => any[];

export class BaseLoaderService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.BaseLoaderService');

  importCallback: GetDataArrayFromFileCallback;
  importFiles: string;
  initialImportCompleted = false;

  onload(): void {
    // If a imported file is changed, re-import it.
    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', async (file, data, cache) => {
        if (this.fileInImportList(file)) {
          this.logger.info(`metadataCache changed event detected for ${file.path}`);
          await this.importArrayToTableFromFile(file, this.importCallback, '');
          this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
        }
      }),
    );
  }

  public fileInImportList(file: TFile): boolean {
    if (!this.importFiles) {
      return false;
    }

    return this.importFiles.split('\n').filter(Boolean).includes(file.path);
  }

  public async settingsInitialLoad(fileList: string) {
    this.logger.info('Initialize Settings');
    this.importFiles = fileList;
    await this.importAllFiles();
    this.initialImportCompleted = true;
  }

  public async settingsUpdateLoad(fileList: string) {
    if (this.initialImportCompleted) {
      this.logger.info('Updated Settings');
      this.importFiles = fileList;
      await this.importAllFiles();
    }
  }

  public async importAllFiles() {
    if (!this.importFiles) {
      return;
    }

    const files = this.importFiles.split('\n').filter(Boolean) ?? [];
    for (const file of files) {
      if (file.startsWith('WEB|')) {
        const pageDetails = file.split('|');
        const tableName = pageDetails[1];
        let url: URL;
        let settings = '';
        if (pageDetails[2].startsWith('SETTINGS:')) {
          settings = pageDetails[2].replace('SETTINGS:', '');
          url = new URL(pageDetails[3]);
        } else {
          url = new URL(pageDetails[2]);
        }

        // eslint-disable-next-line no-await-in-loop
        await this.importArrayToTableFromUrl(url, tableName, this.importCallback, settings);
      } else {
        const queryFile = this.plugin.app.vault.getAbstractFileByPath(file);
        // eslint-disable-next-line no-await-in-loop
        await this.importArrayToTableFromFile((queryFile as TFile), this.importCallback, '');
      }
    }
  }

  public async importArrayToTableFromUrl(url: URL, tableName: string, parseToArrayCallback: GetDataArrayFromFileCallback, settings: string) {
    const response = await fetch(url);
    const content = await response.text();
    await this.importArrayToTable(content, tableName, parseToArrayCallback, settings);
  }

  public async importArrayToTableFromFile(file: TFile, parseToArrayCallback: GetDataArrayFromFileCallback, settings: string) {
    const tableName = file.basename;
    this.logger.info(`Loading '${file.path}' as table '${tableName}'`);
    const content = (await this.plugin.app.vault.cachedRead(file));

    await this.importArrayToTable(content, tableName, parseToArrayCallback, settings);
  }

  public async importArrayToTable(content: string, tableName: string, parseToArrayCallback: GetDataArrayFromFileCallback, settings: string) {
    const startTime = new Date(Date.now());

    this.logger.info(`Importing to ${tableName} with ${settings}`);

    const parsedArray = parseToArrayCallback(content, tableName, settings);
    if (!parsedArray || parsedArray.length === 0) {
      return;
    }

    this.logger.info(`Loaded to table '${tableName}'`, parsedArray);

    alasql(`DROP TABLE IF EXISTS ${tableName}`);
    alasql(`CREATE TABLE IF NOT EXISTS ${tableName}`);
    alasql.tables[tableName].data = parsedArray;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const importedRowCount: number = alasql(`SELECT COUNT(*) AS ImportedRows FROM  ${tableName}`)[0].ImportedRows;
    const endTime = new Date(Date.now());
    this.logger.info(`Imported ${importedRowCount} rows to ${tableName} in ${endTime.getTime() - startTime.getTime()}ms`);
  }
}

