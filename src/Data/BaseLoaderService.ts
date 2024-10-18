import {Notice, Plugin, type TFile} from 'obsidian';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import alasql from 'alasql';

/**
 * A callback type that processes the content of a file and returns an array of data.
 *
 * @callback GetDataArrayFromFileCallback
 * @param {string} content - The content of the file to be processed.
 * @param {string} tableName - The name of the table associated with the data.
 * @returns {Promise<any[]>} A promise that resolves to an array of data extracted from the file.
 */
type GetDataArrayFromFileCallback = (content: string, tableName: string) => Promise<any[]>;

/**
 * The `BaseLoaderService` class extends the `Service` class and provides functionality
 * for loading and importing data from files and URLs into tables. It listens for changes
 * in the metadata cache and re-imports files as necessary.
 *
 * @extends Service
 *
 * @property {Plugin} plugin - The plugin instance used by the service.
 * @property {LoggingService} logger - The logger instance used for logging information.
 * @property {GetDataArrayFromFileCallback} importCallback - The callback function used to parse data from files.
 * @property {string} importFiles - A string containing the list of files to be imported.
 * @property {boolean} initialImportCompleted - A flag indicating whether the initial import has been completed.
 *
 * @method onload - Registers an event listener for changes in the metadata cache.
 * @method fileInImportList - Checks if a given file is in the import list.
 * @method settingsInitialLoad - Initializes settings and performs the initial import of files.
 * @method settingsUpdateLoad - Updates settings and re-imports files if the initial import has been completed.
 * @method importAllFiles - Imports all files listed in the importFiles property.
 * @method importArrayToTableFromUrl - Imports data from a URL into a table.
 * @method importArrayToTableFromFile - Imports data from a file into a table.
 * @method importArrayToTable - Imports parsed data into a table.
 */
export class BaseLoaderService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.BaseLoaderService');

  importCallback: GetDataArrayFromFileCallback;
  importFiles: string;
  initialImportCompleted = false;

  /**
   * Registers an event listener that triggers when a file's metadata changes.
   * If the changed file is in the import list, it logs the event and re-imports the file.
   *
   * @remarks
   * This method uses the `metadataCache.on('changed')` event to detect changes in the metadata of files.
   * When a change is detected, it checks if the file is in the import list. If it is, it logs the change
   * and calls `importArrayToTableFromFile` to re-import the file.
   *
   * @returns {void}
   */
  onload(): void {
    // If a imported file is changed, re-import it.
    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', async (file, data, cache) => {
        if (this.fileInImportList(file)) {
          this.logger.info(`metadataCache changed event detected for ${file.path}`, file);
          await this.importArrayToTableFromFile(file, this.importCallback);
        }
      }),
    );
  }

  /**
   * Checks if a given file is in the import list.
   *
   * @param file - The file to check.
   * @returns `true` if the file is in the import list, `false` otherwise.
   */
  public fileInImportList(file: TFile): boolean {
    if (!this.importFiles) {
      return false;
    }

    return this.importFiles.split('\n').filter(Boolean).includes(file.path);
  }

  /**
   * Initializes the settings by loading the specified files.
   *
   * @param fileList - A string representing the list of files to be imported.
   * @returns A promise that resolves when the initial import is completed.
   */
  public async settingsInitialLoad(fileList: string) {
    this.importFiles = fileList;
    await this.importAllFiles();
    this.initialImportCompleted = true;
  }

  /**
   * Updates the settings and triggers the import of all files if the initial import has been completed.
   *
   * @param fileList - A string representing the list of files to be imported.
   * @returns A promise that resolves when the import process is complete.
   */
  public async settingsUpdateLoad(fileList: string) {
    // If initial import is complete, update settings and re-import all files otherwise
    // do nothing as the initial import will cover it.
    if (this.initialImportCompleted) {
      this.importFiles = fileList;
      await this.importAllFiles();
    }
  }

  /**
   * Imports all files specified in the `importFiles` property.
   *
   * This method processes each file listed in the `importFiles` string, which is expected to be
   * a newline-separated list of file paths or URLs. It supports two types of entries:
   *
   * 1. URLs prefixed with `WEB|`, which are imported using the `importArrayToTableFromUrl` method.
   * 2. Local file paths, which are imported using the `importArrayToTableFromFile` method.
   *
   * For each file:
   * - If the file starts with `WEB|`, it splits the entry to extract the table name and URL,
   *   then imports the data from the URL into the specified table.
   * - If the file is a local path, it attempts to find the file in the vault and import its contents.
   *
   * If a file cannot be found or an error occurs during import, appropriate warnings or error messages
   * are logged.
   *
   * @returns {Promise<void>} A promise that resolves when all files have been processed.
   */
  public async importAllFiles() {
    if (!this.importFiles) {
      return;
    }

    const files = this.importFiles.split('\n').filter(Boolean) ?? [];
    for (const file of files) {
      if (file.startsWith('WEB|')) {
        const pageDetails = file.split('|');
        const tableName = pageDetails[1];
        const url = new URL(pageDetails[2]);
        // eslint-disable-next-line no-await-in-loop
        await this.importArrayToTableFromUrl(url, tableName, this.importCallback);
      } else {
        const queryFile = this.plugin.app.vault.getAbstractFileByPath(file);

        if (!queryFile) {
          this.logger.warn(`Unable to find file ${file} for import, please check your settings.`);
          const missingFileNotice = new Notice(`Unable to find file ${file} for import, please check your settings.`);
          continue;
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          await this.importArrayToTableFromFile((queryFile as TFile), this.importCallback);
        } catch (error) {
          this.logger.info(`Error processing ${file} for import`, error);
        }
      }
    }
  }

  /**
   * Imports data from a given URL into a specified table.
   *
   * @param url - The URL to fetch the data from.
   * @param tableName - The name of the table where the data will be imported.
   * @param parseToArrayCallback - A callback function to parse the fetched content into an array.
   *
   * @returns A promise that resolves when the data has been successfully imported.
   */
  public async importArrayToTableFromUrl(url: URL, tableName: string, parseToArrayCallback: GetDataArrayFromFileCallback) {
    const response = await fetch(url);
    const content = await response.text();
    await this.importArrayToTable(content, tableName, parseToArrayCallback);
  }

  /**
   * Imports data from a file into a table by parsing the file content into an array.
   *
   * @param file - The file to be imported.
   * @param parseToArrayCallback - A callback function to parse the file content into an array.
   * @returns A promise that resolves when the data has been imported into the table.
   */
  public async importArrayToTableFromFile(file: TFile, parseToArrayCallback: GetDataArrayFromFileCallback) {
    const tableName = file.basename;
    this.logger.info(`Loading '${file.path}' as table '${tableName}'`);
    const content = (await this.plugin.app.vault.cachedRead(file));

    await this.importArrayToTable(content, tableName, parseToArrayCallback);
  }

  /**
   * Imports an array of data into a specified table.
   *
   * @param content - The content to be parsed into an array.
   * @param tableName - The name of the table where the data will be imported.
   * @param parseToArrayCallback - A callback function that parses the content into an array.
   *
   * @returns A promise that resolves when the import operation is complete.
   *
   * @remarks
   * - The function logs the start and end time of the import operation.
   * - It drops the table if it exists and creates a new one.
   * - The parsed array is assigned to the table's data.
   * - The function logs the number of rows imported and triggers a refresh event.
   */
  public async importArrayToTable(content: string, tableName: string, parseToArrayCallback: GetDataArrayFromFileCallback) {
    const startTime = new Date(Date.now());

    const parsedArray = await parseToArrayCallback(content, tableName);
    if (!parsedArray || parsedArray.length === 0) {
      return;
    }

    this.logger.debug(`Loaded to table '${tableName}'`, parsedArray);

    await alasql.promise(`DROP TABLE IF EXISTS ${tableName}`);
    await alasql.promise(`CREATE TABLE IF NOT EXISTS ${tableName}`);

    // Drop the parsed array directly into the table data as it is faster than loading via SQL calls.
    alasql.tables[tableName].data = parsedArray;

    const rowsQuery = await alasql.promise(`SELECT COUNT(*) AS ImportedRows FROM  ${tableName}`); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const importedRowCount: number = rowsQuery[0].ImportedRows;
    const endTime = new Date(Date.now());
    this.logger.info(`Imported ${importedRowCount} rows to ${tableName} in ${endTime.getTime() - startTime.getTime()}ms`);
    this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
  }
}

