import alasql from 'alasql';
import { getAPI } from 'obsidian-dataview';
import { parse } from 'yaml';
import { IQuery } from 'Interfaces/IQuery';
import { logging } from 'lib/logging';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';

declare global {
  interface Window {
    customJS?: any;
  }
}

export class QuerySql implements IQuery {
  logger = logging.getLogger('Qatt.QuerySql');

  public name: string;
  private _error: string | undefined = undefined;
  private _rawResults: any;
  private _customJsClasses: Array<[string, string]>;

  // Pending a future PR to enable Custom JS again.
  // private _customJsClasses: Array<[string, string]>;
  private _customTemplate: string = '';

  // Used internally to uniquely log each query execution in the console.
  private _queryId: string = '';

  /**
   * Creates an instance of QuerySql which parses the YAML source and
   * enables execution of the queries in it.
   * @param {string} source
   * @param {string} sourcePath
   * @param {(any | null | undefined)} frontmatter
   * @param {IQueryAllTheThingsPlugin} plugin
   * @memberof QuerySql
   */
  constructor (
    public source: string,
    private sourcePath: string,
    private frontmatter: any | null | undefined,
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this.name = 'QuerySql';
    this._queryId = this.generateQueryId(10);

    this.logger.debugWithId(this._queryId, 'Source Path', this.sourcePath);
    this.logger.debugWithId(this._queryId, 'Source Front Matter', this.frontmatter);

    this._customJsClasses = [];

    // Parse the source, it is a YAML block to make things simpler.
    const queryConfiguration = parse(source);
    if (queryConfiguration.customJSForSql) {
      queryConfiguration.customJSForSql.forEach((element: string) => {
        alasql.fn[element.split(' ')[1]] = window.customJS[element.split(' ')[0]][element.split(' ')[1]];
      });
    }

    // Remove all the comments from the query.
    this.source = queryConfiguration.query;

    this.logger.infoWithId(this._queryId, 'Source Query', this.source);
    this.logger.infoWithId(this._queryId, 'queryConfiguration', queryConfiguration);

    const preCompile = alasql.parse(this.source);
    this.logger.infoWithId(this._queryId, 'Source Query', preCompile);
    // this.logger.infoWithId(this._queryId, 'Data Table', this._dataTable);
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
   * The custom template. Pending future PR.
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof QuerySql
   */
  public get template (): string | undefined {
    return this._customTemplate;
  }

  /**
   * Contains the raw results of query if #raw empty is used.
   *
   * @readonly
   * @type {*}
   * @memberof QuerySql
   */
  public get rawResults (): any {
    return this._rawResults;
  }

  /**
   * This will run the SQL query
   *
   * @return {*}  {*}
   * @memberof QuerySql
   */
  public query (): any {
    this.logger.infoWithId(this._queryId, `Executing query: [${this.source}]`);
    const currentQuery = this;

    // Set moment() function available to AlaSQL.
    alasql.fn.moment = window.moment;

    // Return details about the note the query is running on.
    alasql.fn.notePathWithFileExtension = function () {
      return currentQuery.sourcePath;
    };

    alasql.fn.notePath = function () {
      return currentQuery.sourcePath.split('/').slice(0, -1).join('/');
    };

    alasql.fn.noteFileName = function () {
      return currentQuery.sourcePath.split('/').slice(-1)[0].split('.')[0];
    };

    // Return details about the note the query is running on.
    alasql.fn.pageProperty = function (field: string) {
      return currentQuery.frontmatter[field];
    };

    alasql.fn.getNoteName = function (path) {
      return path.split('/').slice(-1)[0].split('.')[0];
    };

    // Needs integration with customJS, will be added in later revision.
    this._customJsClasses.forEach((element) => {
      alasql.fn[element[1]] = window.customJS[element[0]][element[1]];
    });

    // Allows user to add debugMe() to the query to break into the debugger.
    // Example: WHERE debugMe()
    alasql.fn.debugMe = function () {
      // eslint-disable-next-line no-debugger
      debugger;
    };

    // Return the ID of this query used for debugging as needed.
    alasql.fn.queryId = function () {
      return currentQuery._queryId;
    };

    alasql.options.nocount = true; // Disable row count for queries.

    let queryResult: any;

    // check each query statement for the table it wants to query and if a
    // internal table replace with the right data source to query for that instance.
    try {
      this.source.split(';').forEach((v) => {
        if (v.trim() !== '') {
          let query = v;
          let dataTable: any[] = [];
          if (/\bobsidian_markdown_notes\b/gi.test(v)) {
            query = v.replace(/\bobsidian_markdown_notes\b/gi, '$0');
            dataTable = this.plugin.app.vault.getMarkdownFiles();
          } else if (/\bdataview_pages\b/gi.test(v)) {
            query = v.replace(/\bdataview_pages\b/gi, '$0');
            const dataViewApi = getAPI(this.plugin.app);
            dataTable = dataViewApi ? Array.from(dataViewApi.index.pages.values()) : [];

            // } else if (/\bdataview_pages_map\b/ig.test(v)) {
            //     query = v.replace(/\bdataview_pages_map\b/ig, '?');
            //     dataTable = getAPI(this._plugin.app).index.pages;
          }
          this.logger.logWithId(this._queryId, 'query:', query);

          queryResult = alasql(query, [dataTable]);
        }
      });
      // if (this._dataTable !== undefined) {
      //     queryResult = alasql(this.source, [this._dataTable]);
      // } else {
      //     queryResult = alasql(this.source, []);
      // }
    } catch (error) {
      this._error = `Error with query: ${error}`;
      this.logger.errorWithId(this._queryId, 'Error with query', error);
      queryResult = [];
    }
    this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length}`, queryResult);
    return queryResult;
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
