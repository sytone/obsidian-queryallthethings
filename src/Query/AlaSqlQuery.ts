import alasql from 'alasql';
import {getAPI} from 'obsidian-dataview';
import {logging} from 'lib/Logging';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IQuery} from 'Query/IQuery';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    customJS?: any;
  }
}

export class AlaSqlQuery implements IQuery {
  /**
   * Any generic Alasql functions should go in here so they are only called
   * once.
   *
   * @static
   * @param {IQueryAllTheThingsPlugin} plugin
   * @memberof QuerySql
   */
  public static initialize() {
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
    ### stringify(value)

    The `stringify` function will convert the provided value to a JSON string.

    {% raw %}

    ```qatt
    query: SELECT TOP 1 stringify(stat) AS statPropertyAsJsonString FROM obsidian_markdown_notes
    template: |
      {{#each result}}{{statPropertyAsJsonString}}{{/each}}
    ```

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

    alasql.fn.objectFromMap = function (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Object.fromEntries(value);
    };

    alasql.options.nocount = true; // Disable row count for queries.
  }

  private readonly _logger = logging.getLogger('Qatt.AlaSqlQuery');
  private readonly _name: string;
  private readonly _queryId: string;
  private _error: string | undefined = undefined;
  private readonly _customJsClasses: Array<[string, string]>;

  // Pending a future PR to enable Custom JS again.
  // private _customJsClasses: Array<[string, string]>;

  private readonly _sqlQuery: string;

  /**
   * Creates an instance of QuerySql which parses the YAML source and
   * enables execution of the queries in it.
   * @param {QattCodeBlock} queryConfiguration
   * @param {string} sourcePath
   * @param {(any | null | undefined)} frontmatter
   * @param {IQueryAllTheThingsPlugin} plugin
   * @memberof QuerySql
   */
  constructor(
    public queryConfiguration: QattCodeBlock,
    private readonly sourcePath: string,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    private readonly frontmatter: any | undefined,
    private readonly plugin: IQueryAllTheThingsPlugin,
  ) {
    this._name = 'QuerySql';

    if (this.queryConfiguration.query === undefined) {
      throw new Error('Query is not defined in the code block, the query field is mandatory.');
    }

    if (this.queryConfiguration.logLevel) {
      this._logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this._queryId = this.generateQueryId(10);
    this._customJsClasses = [];

    // Parse the source, it is a YAML block to make things simpler.
    if (queryConfiguration.customJSForSql) {
      for (const element of queryConfiguration.customJSForSql) {
        const className = element.split(' ')[0];
        const functionName = element.split(' ')[1];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        alasql.fn[functionName] = window.customJS[className][functionName];
      }
    }

    this._logger.debugWithId(this._queryId, 'Source Path', this.sourcePath);
    this._logger.debugWithId(this._queryId, 'Source Front Matter', this.frontmatter);
    this._logger.debugWithId(this._queryId, 'Source Query', this.queryConfiguration.query);
    this._logger.debugWithId(this._queryId, 'queryConfiguration', queryConfiguration);

    // Pre compile the query to find any errors.
    try {
      const preCompile = alasql.parse(this.queryConfiguration.query);
      this._logger.debugWithId(this._queryId, 'Source Query', preCompile);
    } catch (error) {
      this._error = `Error with query: ${error as string}`;
      this._logger.errorWithId(this._queryId, `Error with query on page [${sourcePath}]:`, error);
    }

    this._sqlQuery = this.queryConfiguration.query;
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
  public query(): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const currentQuery = this;

    // Return the full path the query is running on.
    alasql.fn.notePathWithFileExtension = function () {
      return currentQuery.sourcePath;
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
          const query = this.getParsedQuery(v);
          const dataTable: any[] = this.getDataTable(v);

          this._logger.debugWithId(this._queryId, 'Executing Query:', {originalQuery: this.queryConfiguration.query, parsedQuery: query});
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          queryResult = alasql(query, [dataTable]);
        }
      }
    } catch (error) {
      this._error = `Error with query: ${error as string}`;
      this._logger.errorWithId(this._queryId, `Error with query on page [${this.sourcePath}]:`, error);
      queryResult = [];
    }

    this._logger.debugWithId(this._queryId, `queryResult: ${queryResult.length as number}`, queryResult);
    return queryResult;
  }

  private getParsedQuery(query: string) {
    let finalQuery = query;
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
      finalQuery = query.replace(/\bobsidian_markdown_notes\b/gi, '$0');
    } else if (/\bobsidian_markdown_files\b/gi.test(query)) {
      finalQuery = query.replace(/\bobsidian_markdown_files\b/gi, '$0');
    } else if (/\bdataview_pages\b/gi.test(query)) {
      finalQuery = query.replace(/\bdataview_pages\b/gi, '$0');
    }

    return finalQuery;
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

  private getDataTable(query: string): any[] {
    let dataTable: any[] = [];
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
      dataTable = this.plugin.app.vault.getMarkdownFiles();
    } else if (/\bobsidian_markdown_files\b/gi.test(query)) {
      dataTable = this.plugin.app.vault.getMarkdownFiles();
    } else if (/\bdataview_pages\b/gi.test(query)) {
      const dataViewApi = getAPI(this.plugin.app);
      dataTable = dataViewApi ? Array.from(dataViewApi.index.pages.values()) : [];
    }

    return dataTable;
  }

  /**
   * This is the public entry point for getting the query results.
   *
   * @return {*}  {*}
   * @memberof QuerySql
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public applyQuery(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const queryResult: any = this.query();

    return queryResult;
  }

  /**
   * Creates a unique ID for correlation of console logging.
   *
   * @private
   * @param {number} length
   * @return {*}  {string}
   * @memberof QuerySql
   */
  private generateQueryId(length: number): string {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
  }
}
