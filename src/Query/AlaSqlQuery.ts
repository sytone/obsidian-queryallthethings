
import alasql from 'alasql';
import {type FrontMatterCache, Plugin, type TFile} from 'obsidian';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IQuery} from 'Query/IQuery';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {NotesCacheService} from 'NotesCacheService';
import {DataviewService} from 'Integrations/DataviewService';
import {confirmObjectPath} from 'Internal';
import * as alasqlFunctions from 'Query/Functions';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    customJS?: any;
  }
}

export class AlaSqlQuery extends Service implements IQuery {
  /**
   * Any generic Alasql functions should go in here so they are only called
   * once.
   *
   * @static
   * @memberof QuerySql
   */
  public static initialize() {
    // Add the alasql engine to the exposed API. Thi
    // will allow the user to use the full power of AlaSQL.
    confirmObjectPath('_qatt.query.alasql', alasql);

    // Set moment() function available to AlaSQL.
    alasql.fn.moment = window.moment;

    alasql.fn.getNoteName = function (path: string): string {
      return path.split('/').slice(-1)[0].split('.')[0];
    };

    // Allows user to add debugMe() to the query to break into the debugger.
    // Example: WHERE debugMe()
    alasql.fn.debugMe = function () {
      // eslint-disable-next-line no-debugger
      debugger;
    };

    // Load all the functions referenced in the Functions folder.
    for (const alasqlFunction of Object.entries(alasqlFunctions)) {
      alasqlFunction[1]();
    }

    alasql.fn.objectFromMap = function (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Object.fromEntries(value);
    };

    alasql.options.nocount = true; // Disable row count for queries.
  }

  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.AlaSqlQuery');
  notesCache = this.use(NotesCacheService);
  dvService = this.use(DataviewService);

  public codeblockConfiguration: QattCodeBlock;
  private sourcePath: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private frontmatter: any | undefined;

  private _name: string;
  private _queryId: string;
  private _error: string | undefined = undefined;
  private _customJsClasses: Array<[string, string]>;
  private queryFile: TFile;
  private codeBlockFile: TFile;

  // Pending a future PR to enable Custom JS again.
  // private _customJsClasses: Array<[string, string]>;

  private _sqlQuery: string;

  public async setupQuery(
    codeblockConfiguration: QattCodeBlock,
    sourcePath: string,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    frontmatter: any | undefined,
    renderId: string,
  ): Promise<void> {
    this._name = 'QuerySql';
    this.codeblockConfiguration = codeblockConfiguration;
    this.sourcePath = sourcePath;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.frontmatter = frontmatter;
    this.codeBlockFile = this.plugin.app.vault.getAbstractFileByPath(this.sourcePath) as TFile;

    if (this.codeblockConfiguration.query === undefined && this.codeblockConfiguration.queryFile === undefined) {
      throw new Error('Query is not defined in the code block, either the query or queryFile field is mandatory.');
    }

    if (this.codeblockConfiguration.queryFile) {
      this.queryFile = this.plugin.app.vault.getAbstractFileByPath(this.codeblockConfiguration.queryFile) as TFile;
      const content = (await this.plugin.app.vault.cachedRead(this.queryFile));
      this._sqlQuery = content;
    } else {
      this._sqlQuery = this.codeblockConfiguration.query ?? '';
    }

    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    this._queryId = renderId;
    this.logger.groupId(this._queryId);
    this._customJsClasses = [];

    // Parse the source, it is a YAML block to make things simpler.
    if (codeblockConfiguration.customJSForSql) {
      for (const element of codeblockConfiguration.customJSForSql) {
        const className = element.split(' ')[0];
        const functionName = element.split(' ')[1];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        alasql.fn[functionName] = window.customJS[className][functionName];
      }
    }

    this.logger.debugWithId(this._queryId, `Setting up query on:${this.sourcePath}`);

    this.logger.debugWithId(this._queryId, 'Source Path', this.sourcePath);
    this.logger.debugWithId(this._queryId, 'Source Front Matter', this.frontmatter);
    this.logger.debugWithId(this._queryId, 'Source Query', this._sqlQuery);
    this.logger.debugWithId(this._queryId, 'codeblockConfiguration', codeblockConfiguration);

    // Pre compile the query to find any errors.
    try {
      const preCompile = alasql.parse(this._sqlQuery);
      this.logger.debugWithId(this._queryId, 'Source Query', preCompile);
    } catch (error) {
      this._error = `Error with query: ${error as string}`;
      this.logger.errorWithId(this._queryId, `Error with query on page [${sourcePath}]:`, error);
    }

    this.logger.groupEndId();
  }

  /**
   * Returns the error message if any errors occur. It is 'undefined' if no errors.
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof QuerySql
   */
  public get error(): string | undefined {
    return this._error;
  }

  /**
   * Returns the error message if any errors occur. It is 'undefined' if no errors.
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof QuerySql
   */
  public get name(): string | undefined {
    return this._name;
  }

  /**
   * The ID of this query execution.
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof QuerySql
   */
  public get queryId(): string | undefined {
    return this._queryId;
  }

  /**
   * This will run the SQL query
   *
   * @return {*}  {*}
   * @memberof QuerySql
   */
  public async query(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const currentQuery = this;

    const sourcePath = currentQuery.sourcePath;
    this.logger.groupId(this._queryId);
    this.logger.debugWithId(this._queryId, `Running query on:${this.sourcePath}`);

    // Return the full path the query is running on.
    alasql.fn.notePathWithFileExtension = function () {
      return sourcePath;
    };

    // Return the full path the query is running on.
    alasql.fn.notePathWithoutFileExtension = function () {
      return sourcePath.split('.')[0];
    };

    // Return the path to the current page the query is running on.
    alasql.fn.notePath = function () {
      return sourcePath.split('/').slice(0, -1).join('/');
    };

    // Return the filename for the current page the query is running on.
    alasql.fn.noteFileName = function () {
      return sourcePath.split('/').slice(-1)[0].split('.')[0];
    };

    /*
// >> id='docs-sql-statements-pageproperty' options='file=queries/sql-statements/pageproperty.md'
title: pageProperty
---

## Syntax

```sql
pageProperty ( string )
```

## Returns

Returns the value of the front matter field specified from the page the query is running on.

## Example

The following example returns the frontmatter->status value reversed.

```yaml
query: |
  SELECT pageProperty('task_status') AS TaskStatus
template: |
  {{#each result}}
    The page property 'task_status' is set to {{TaskStatus}}
  {{/each}}
```

```text
The page property 'task_status' is set to x

```

Open these pages in an Obsidian vault and view 'Examples\using-pageproperty-simple-live.md' for a live example.

// << docs-sql-statements-pageproperty
*/
    alasql.fn.pageProperty = function (field: string) {
      const fileCache = currentQuery.plugin.app.metadataCache.getFileCache(currentQuery.codeBlockFile);
      if (fileCache?.frontmatter !== undefined) {
        const frontmatter: FrontMatterCache = fileCache.frontmatter;

        // CurrentQuery.logger.infoWithId(this._queryId, `Getting frontmatter for :${field}`,frontmatter[field]);
        return frontmatter[field] as string;
      }

      return '';
    };

    // eslint-disable-next-line max-params
    alasql.from.PAGEPROPERTY = function (field: string, options: any, cb: any, idx: any, query: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let result = currentQuery.frontmatter[field];

      //	Res = new alasql.Recordset({data:res,columns:{columnid:'_'}});
      if (cb) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        result = cb(result, idx, query);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    };

    // Return the ID of this query used for debugging as needed.
    alasql.fn.queryId = function () {
      return currentQuery._queryId;
    };

    // Needs integration with customJS, will be added in later revision.
    for (const element of this._customJsClasses) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      alasql.fn[element[1]] = window.customJS[element[0]][element[1]];
    }

    let queryResult: any;
    const resultArray = [];

    try {
      for (const v of this._sqlQuery.split(';')) {
        if (v.trim() !== '') {
          // eslint-disable-next-line no-await-in-loop
          const [parsedQuery, dataTables] = await this.getDataTables(v);
          // Old const dataTable: any[] = this.getDataTable(v);

          this.logger.debugWithId(this._queryId, 'Data Tables:', dataTables);
          this.logger.debugWithId(this._queryId, 'Executing Query:', {originalQuery: this.codeblockConfiguration.query, parsedQuery});
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-await-in-loop
          queryResult = await alasql.promise(parsedQuery, dataTables);
          resultArray.push(queryResult);
        }
      }
    } catch (error) {
      this._error = `Error with query: ${error as string}`;
      this.logger.errorWithId(this._queryId, `Error with query on page [${this.sourcePath}]:`, error);
      queryResult = [];
    }

    if (resultArray.length > 1) {
      queryResult = resultArray;
    }

    this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length as number}`, queryResult);
    this.logger.groupEndId();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return queryResult;
  }

  /**
   * Retrieves data tables based on the provided query. This will use the arrays in the caches to get data
   * for the query. In 0.11.x+ there are now tables available as well.
   * @param query - The query string.
   * @returns A promise that resolves to an array containing the final query and an array of data tables.
   */
  private async getDataTables(query: string): Promise<[string, any[]]> {
    let finalQuery = query;
    let tableCount = 0;
    const dataArrays = [];

    // Loop through the query and find all the tables and replace with $x
    while (/\bobsidian_markdown_notes\b/i.test(finalQuery)) {
      finalQuery = finalQuery.replace(/\bobsidian_markdown_notes\b/i, `$${tableCount}`);
      tableCount++;
      // eslint-disable-next-line no-await-in-loop
      dataArrays.push(await this.notesCache.getNotes());
    }

    while (/\bobsidian_markdown_lists\b/i.test(finalQuery)) {
      finalQuery = finalQuery.replace(/\bobsidian_markdown_lists\b/i, `$${tableCount}`);
      tableCount++;
      // eslint-disable-next-line no-await-in-loop
      dataArrays.push(await this.notesCache.getLists());
    }

    while (/\bobsidian_markdown_tasks\b/i.test(finalQuery)) {
      finalQuery = finalQuery.replace(/\bobsidian_markdown_tasks\b/i, `$${tableCount}`);
      tableCount++;
      // eslint-disable-next-line no-await-in-loop
      dataArrays.push(await this.notesCache.getTasks());
    }

    while (/\bobsidian_markdown_files\b/i.test(finalQuery)) {
      finalQuery = finalQuery.replace(/\bobsidian_markdown_files\b/i, `$${tableCount}`);
      tableCount++;
      dataArrays.push(this.plugin.app.vault.getMarkdownFiles());
    }

    while (/\bdataview_pages\b/i.test(finalQuery)) {
      finalQuery = finalQuery.replace(/\bdataview_pages\b/i, `$${tableCount}`);
      tableCount++;
      dataArrays.push(this.dvService.getDataviewPagesArray());
    }

    return [finalQuery, dataArrays];
  }

  /**
   * This is the public entry point for getting the query results.
   *
   * @return {*}  {*}
   * @memberof QuerySql
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async applyQuery(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const queryResult: any = await this.query();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return queryResult;
  }
}
