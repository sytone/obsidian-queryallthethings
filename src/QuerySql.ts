import alasql from 'alasql';
import { getAPI } from 'obsidian-dataview';
import { IQuery } from 'Interfaces/IQuery';
import { logging } from 'lib/logging';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { QattCodeBlock } from 'QattCodeBlock';

declare global {
  interface Window {
    customJS?: any;
  }
}

export class QuerySql implements IQuery {
  _logger = logging.getLogger('Qatt.QuerySql');

  public name: string;
  private _error: string | undefined = undefined;
  private _customJsClasses: Array<[string, string]>;

  // Pending a future PR to enable Custom JS again.
  // private _customJsClasses: Array<[string, string]>;

  // Used internally to uniquely log each query execution in the console.
  private _queryId: string = '';
  private _sqlQuery: string;

  /**
   * Creates an instance of QuerySql which parses the YAML source and
   * enables execution of the queries in it.
   * @param {QattCodeBlock} queryConfiguration
   * @param {string} sourcePath
   * @param {(any | null | undefined)} frontmatter
   * @param {IQueryAllTheThingsPlugin} plugin
   * @memberof QuerySql
   */
  constructor (
    public queryConfiguration: QattCodeBlock,
    private sourcePath: string,
    private frontmatter: any | null | undefined,
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this.name = 'QuerySql';

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
      queryConfiguration.customJSForSql.forEach((element: string) => {
        alasql.fn[element.split(' ')[1]] = window.customJS[element.split(' ')[0]][element.split(' ')[1]];
      });
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
      this._error = `Error with query: ${error}`;
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
  public get error (): string | undefined {
    return this._error;
  }

  /**
   * The ID of this query execution.
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof QuerySql
   */
  public get queryId (): string | undefined {
    return this._queryId;
  }

  /**
   * Any generic Alasql functions should go in here so they are only called
   * once.
   *
   * @static
   * @param {IQueryAllTheThingsPlugin} plugin
   * @memberof QuerySql
   */
  public static initialize (plugin: IQueryAllTheThingsPlugin) {
    // Set moment() function available to AlaSQL.
    alasql.fn.moment = window.moment;

    alasql.fn.getNoteName = function (path) {
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
      return Array.from(value);
    };

    alasql.fn.objectFromMap = function (value) {
      return Object.fromEntries(value);
    };

    alasql.options.nocount = true; // Disable row count for queries.
  }

  /**
   * This will run the SQL query
   *
   * @return {*}  {*}
   * @memberof QuerySql
   */
  public query (): any {
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
      return currentQuery.frontmatter[field];
    };

    // Return the ID of this query used for debugging as needed.
    alasql.fn.queryId = function () {
      return currentQuery._queryId;
    };

    // Needs integration with customJS, will be added in later revision.
    this._customJsClasses.forEach((element) => {
      alasql.fn[element[1]] = window.customJS[element[0]][element[1]];
    });

    let queryResult: any;
    try {
      this._sqlQuery.split(';').forEach((v) => {
        if (v.trim() !== '') {
          const query = this.getParsedQuery(v);
          const dataTable: any[] = this.getDataTable(v);

          this._logger.debugWithId(this._queryId, 'Executing Query:', { originalQuery: this.queryConfiguration.query, parsedQuery: query });
          queryResult = alasql(query, [dataTable]);
        }
      });
    } catch (error) {
      this._error = `Error with query: ${error}`;
      this._logger.errorWithId(this._queryId, `Error with query on page [${this.sourcePath}]:`, error);
      queryResult = [];
    }
    this._logger.debugWithId(this._queryId, `queryResult: ${queryResult.length}`, queryResult);
    return queryResult;
  }

  private getParsedQuery (query: string) {
    let finalQuery = query;
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
      finalQuery = query.replace(/\bobsidian_markdown_notes\b/gi, '$0');
    } else if (/\bdataview_pages\b/gi.test(query)) {
      finalQuery = query.replace(/\bdataview_pages\b/gi, '$0');
    }

    return finalQuery;
  }

  private getDataTable (query: string): any[] {
    let dataTable: any[] = [];
    if (/\bobsidian_markdown_notes\b/gi.test(query)) {
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
  public applyQuery (): any {
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
  private generateQueryId (length: number): string {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
  }
}
