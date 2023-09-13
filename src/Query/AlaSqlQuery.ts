
import alasql from 'alasql';
import {Plugin, type TFile} from 'obsidian';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IQuery} from 'Query/IQuery';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {NotesCacheService} from 'NotesCacheService';
import {DataviewService} from 'Integrations/DataviewService';
import {confirmObjectPath} from 'Internal';

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

    // Allows the user to map a item to an array, for example a Map via mapname->values()
    alasql.fn.arrayFrom = function (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Array.from(value);
    };

    /*
    // >> alasql-function-stringify-snippet

    The `stringify` function will convert the provided value to a JSON string.

    In this example it takes the `stat` property of the first note found and renders it as a JSON blob. This can be handy to explore objects if you are not sure what is available.

    {% raw %}

    ````markdown
    ```qatt
    query: SELECT TOP 1 stringify(stat) AS statPropertyAsJsonString FROM obsidian_markdown_notes
    template: |
      {{#each result}}{{statPropertyAsJsonString}}{{/each}}
    ```
    ````

    {% endraw %}

    will result in:

    ```text
    {"ctime":1670345758620,"mtime":1670345758620,"size":316}
    ```

    // << alasql-function-stringify-snippet
    */
    alasql.fn.stringify = function (value) {
      return JSON.stringify(value);
    };

    /*
    // >> docs-alasql-function-parsewikilinks

    There are multiple functions to help with the parsing of the wiki links in a string.

    This is the signature of the functions you can use in the queries.

    - parseWikiLinkLocation(value: string): string
    - parseWikiDisplayName(value: string): string
    - wikiLinkHasDisplayName(value: string): boolean

    In this example it takes the string containing the wiki link and calls the different parsing functions.

    ```text
    Need to work on [[Projects/Painting The House|Painting The House]] soon.
    ```

    {% raw %}

    ````markdown
    ```qatt
    query: |
      SELECT
      parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Location,
      parseWikiDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Display,
      wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS HasDisplay,
      wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.') AS HasNoDisplay,
      IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.')) AS HasDisplayIf,
      IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.'), parseWikiDisplayName('Need to work on [[Projects/Painting The House|Will Not show]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House]] soon.')) AS HasNoDisplayIf
    template: |
      {{stringify result}}
    ```
    ````

    {% endraw %}

    will result in:

    ```text
    [ { "Location": "Projects/Painting The House", "Display": "Painting The House", "HasDisplay": true, "HasNoDisplay": false, "HasDisplayIf": "Painting The House", "HasNoDisplayIf": "Projects/Painting The House" } ]
    ```

    // << docs-alasql-function-parsewikilinks
    */
    alasql.fn.parseWikiLinkLocation = function (value: string): string {
      const result = parseWikiLinkFromText(value);

      if (result) {
        const linkAndDisplay = splitOnUnescapedPipe(result);
        return linkAndDisplay[0];
      }

      return '';
    };

    alasql.fn.parseWikiDisplayName = function (value: string): string {
      const result = parseWikiLinkFromText(value);
      if (result) {
        const linkAndDisplay = splitOnUnescapedPipe(result);
        return linkAndDisplay[1] ?? '';
      }

      return '';
    };

    alasql.fn.wikiLinkHasDisplayName = function (value: string): boolean {
      const result = parseWikiLinkFromText(value);
      if (!result) {
        return false;
      }

      const linkAndDisplay = splitOnUnescapedPipe(result);
      return linkAndDisplay.length === 2 && linkAndDisplay[1] !== undefined;
    };

    function parseWikiLinkFromText(text: string): string | undefined {
      const re = /\[\[([^\[\]]*?)\]\]/u;

      const result = re.exec(text);
      if (result) {
        return result[1];
      }
    }

    /** Split on unescaped pipes in an inner link. */
    function splitOnUnescapedPipe(link: string): [string, string | undefined] {
      let pipe = -1;
      while ((pipe = link.indexOf('|', pipe + 1)) >= 0) {
        if (pipe > 0 && link[pipe - 1] === '\\') {
          continue;
        }

        return [link.slice(0, Math.max(0, pipe)).replace(/\\\|/g, '|'), link.slice(Math.max(0, pipe + 1))];
      }

      return [link.replace(/\\\|/g, '|'), undefined];
    }

    alasql.fn.objectFromMap = function (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Object.fromEntries(value);
    };

    alasql.fn.REVERSE = function (value: string): string {
      return value.split('').reverse().join('');
    };

    alasql.fn.CHARINDEX = function (expressionToFind: string, expressionToSearch: string, start_location?: number): number {
      if (start_location !== undefined) {
        return expressionToSearch.indexOf(expressionToFind, start_location) + 1;
      }

      return expressionToSearch.indexOf(expressionToFind) + 1;
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

    if (this.codeblockConfiguration.query === undefined && this.codeblockConfiguration.queryFile === undefined) {
      throw new Error('Query is not defined in the code block, either the query or queryFile field is mandatory.');
    }

    if (this.codeblockConfiguration.queryFile) {
      const queryFile = this.plugin.app.vault.getAbstractFileByPath(this.codeblockConfiguration.queryFile);
      const content = (await this.plugin.app.vault.cachedRead(queryFile as TFile));
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

    this.logger.infoWithId(this._queryId, `Setting up query on:${this.sourcePath}`);

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
    this.logger.groupId(this._queryId);
    this.logger.infoWithId(this._queryId, `Running query on:${this.sourcePath}`);

    // Return the full path the query is running on.
    alasql.fn.notePathWithFileExtension = function () {
      return currentQuery.sourcePath;
    };

    // Return the full path the query is running on.
    alasql.fn.notePathWithoutFileExtension = function () {
      return currentQuery.sourcePath.split('.')[0];
    };

    // Return the path to the current page the query is running on.
    alasql.fn.notePath = function () {
      return currentQuery.sourcePath.split('/').slice(0, -1).join('/');
    };

    // Return the filename for the current page the query is running on.
    alasql.fn.noteFileName = function () {
      return currentQuery.sourcePath.split('/').slice(-1)[0].split('.')[0];
    };

    // Return the front matter field from the page the query is running on.
    alasql.fn.pageProperty = function (field: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return currentQuery.frontmatter[field];
    };

    // eslint-disable-next-line max-params
    alasql.from.pageProperty = function (field: string, options: any, cb: any, idx: any, query: any) {
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
    try {
      for (const v of this._sqlQuery.split(';')) {
        if (v.trim() !== '') {
          const [parsedQuery, dataTables] = await this.getDataTables(v);
          // Old const dataTable: any[] = this.getDataTable(v);

          this.logger.debugWithId(this._queryId, 'Data Tables:', dataTables);
          this.logger.debugWithId(this._queryId, 'Executing Query:', {originalQuery: this.codeblockConfiguration.query, parsedQuery});
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          queryResult = alasql(parsedQuery, dataTables);
        }
      }
    } catch (error) {
      this._error = `Error with query: ${error as string}`;
      this.logger.errorWithId(this._queryId, `Error with query on page [${this.sourcePath}]:`, error);
      queryResult = [];
    }

    this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length as number}`, queryResult);
    this.logger.groupEndId();

    return queryResult;
  }

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

  /*
  Update the table below when new columns are added so documentation is updated.
  // >> obsidian-markdown-files-table-snippet

  If you need to reference a property of a object do not forget to use `->` and not `.`

  | Column Name | Type   | Description                                     |
  | ----------- | ------ | ----------------------------------------------- |
  | path        | string | Full path to the markdown file.                 |
  | name        | string | The name of the file including the extension.   |
  | basename    | number | Just the name of the file.                      |
  | extension   | number | The extension of the file. Usually `md`         |
  | stat        | object | contains the time and size details of the file. |
  | stat->ctime | number | Time the file was creates as a serial.          |
  | stat->mtime | number | Time the file was last modified as a serial.    |
  | stat->size  | number | Size of the file in bytes                       |

  // << obsidian-markdown-files-table-snippet
  */

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
