import alasql from 'alasql';
import { getAPI } from "obsidian-dataview";
import { parse } from 'yaml'
import { IQuery } from 'Interfaces/IQuery';
import { LayoutOptions } from 'LayoutOptions';
import { logging } from 'lib/logging';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';

export class QuerySql implements IQuery {
    logger = logging.getLogger('Qatt.QuerySql');

    public source: string;
    public name: string;

    // @ts-ignore
    private _sourcePath: string;
    // @ts-ignore
    private _frontmatter: any | null | undefined;

    private _plugin: IQueryAllTheThingsPlugin;
    private _layoutOptions: LayoutOptions = new LayoutOptions();

    private _error: string | undefined = undefined;
    private _rawResults: any;

    // Pending a future PR to enable Custom JS again.
    private _customJsClasses: Array<[string, string]>;
    private _customTemplate: string = '';

    // Used internally to uniquely log each query execution in the console.
    private _queryId: string = '';

    /**
     * Creates an instance of QuerySql.
     * @param {({
     *         source: string;
     *         sourcePath: string;
     *         frontmatter: any | null | undefined;
     *     })} {
     *         source,
     *         sourcePath,
     *         frontmatter
     *     } - This is a collection of the source query, the path to the source query, and the frontmatter.
     * @memberof QuerySql
     */
    constructor({
        source,
        sourcePath,
        frontmatter,
        plugin,
    }: {
        source: string;
        sourcePath: string;
        frontmatter: any | null | undefined;
        plugin: IQueryAllTheThingsPlugin;
    }) {
        this.name = 'QuerySql';
        this._queryId = this.generateQueryId(10);
        this._plugin = plugin

        this._sourcePath = sourcePath;
        this._frontmatter = frontmatter;
        this.logger.debugWithId(this._queryId, 'Source Path', this._sourcePath);
        this.logger.debugWithId(this._queryId, 'Source Front Matter', this._frontmatter);

        // Pending a future PR to enable Custom JS again.
        this._customJsClasses = [];

        // Parse the source, it is a YAML block to make things simpler.
        const queryConfiguration = parse(source);

        // Remove all the comments from the query.
        this.source = queryConfiguration.query;



        this.logger.infoWithId(this._queryId, 'Source Query', this.source);
        this.logger.infoWithId(this._queryId, 'queryConfiguration', queryConfiguration);

        let preCompile = alasql.parse(this.source);
        this.logger.infoWithId(this._queryId, 'Source Query', preCompile);
        //this.logger.infoWithId(this._queryId, 'Data Table', this._dataTable);

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
     * The custom template. Pending future PR.
     *
     * @readonly
     * @type {(string | undefined)}
     * @memberof QuerySql
     */
    public get template(): string | undefined {
        return this._customTemplate;
    }

    /**
     * The layout options for this query.
     *
     * @readonly
     * @type {LayoutOptions}
     * @memberof QuerySql
     */
    public get layoutOptions(): LayoutOptions {
        return this._layoutOptions;
    }

    /**
     * Contains the raw results of query if #raw empty is used.
     *
     * @readonly
     * @type {*}
     * @memberof QuerySql
     */
    public get rawResults(): any {
        return this._rawResults;
    }


    /**
     * This will run the SQL query against the collection of tasks and
     * will return the tasks that match the query.
     *
     * @param {Task[]} tasks
     * @return {*}  {Task[]}
     * @memberof QuerySql
     */
    public query(): any {
        this.logger.infoWithId(this._queryId, `Executing query: [${this.source}]`);
        const currentQuery = this;

        /*
         * As we are using alaSQL we can take advantage of a in memory cache. The pagedata
         * table contains the source path for the executing code block when rendered. This
         * allows the code block to reference the page it is being rendered on and access
         * the page meta data for more complex queries.
         */
        // if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
        //     alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        // }

        // if (alasql(`SELECT keyvalue FROM pagedata WHERE name = "sourcePath${this._queryId}"`).length == 0) {
        //     alasql(`INSERT INTO pagedata VALUES ('sourcePath${this._queryId}','${this._sourcePath.replace("'", "''")}')`);
        // }

        // Set moment() function available to AlaSQL.
        alasql.fn.moment = window.moment;

        // Return details about the note the query is running on.
        alasql.fn.notePathWithFileExtension = function () {
            return currentQuery._sourcePath;
        };

        alasql.fn.notePath = function () {
            return currentQuery._sourcePath.split('/').slice(0, -1).join('/');
        };

        alasql.fn.noteFileName = function () {
            return currentQuery._sourcePath.split('/').slice(-1)[0].split('.')[0];
        };

        // Return details about the note the query is running on.
        alasql.fn.pageProperty = function (field: string) {
            return currentQuery._frontmatter[field];
        };

        alasql.fn.getNoteName = function (path) {
            return path.split('/').slice(-1)[0].split('.')[0];
        };

        // Needs integration with customJS, will be readded in later revision.
        // this._customJsClasses.forEach((element) => {
        //     alasql.fn[element[1]] = window.customJS[element[0]][element[1]];
        // });

        // Allows user to add debugMe() to the query to break into the debugger.
        // Example: WHERE debugMe()
        alasql.fn.debugMe = function () {
            // eslint-disable-next-line no-debugger
            debugger;
        };

        // Needs access to the metadata cache of Obsidian to get page data from front matter to use in query,
        // will be readded in later revision.
        // alasql.fn.queryBlockFile = function () {
        //     const result = alasql(`SELECT keyvalue FROM pagedata WHERE name = "sourcePath${this._queryId}"`);
        //     if (result.length == 1) {
        //         const fileCache = TasksServices.obsidianApp.metadataCache.getCache(result[0].keyvalue);

        //         return {
        //             frontmatter: fileCache?.frontmatter,
        //             tags: fileCache?.tags,
        //             path: result[0].keyvalue,
        //             basename: result[0].keyvalue.split('/').slice(-1)[0].split('.')[0],
        //         };
        //     }

        //     return {
        //         frontmatter: null,
        //         tags: [],
        //         path: result[0].keyvalue,
        //         basename: result[0].keyvalue.split('/').slice(-1)[0].split('.')[0],
        //     };
        // };

        // Return the ID of this query used for debugging as needed.
        alasql.fn.queryId = function () {
            return currentQuery._queryId;
        };

        alasql.options.nocount = true; // Disable row count for queries.

        let queryResult: any;



        try {
            this.source.split(';').forEach(v => {
                if (v.trim() !== '') {
                    let query = v;
                    let dataTable: any[] = [];
                    if (/\bobsidian_markdown_notes\b/ig.test(v)) {
                        query = v.replace(/\bobsidian_markdown_notes\b/ig, '$0');
                        dataTable = this._plugin.app.vault.getMarkdownFiles();
                    } else if (/\bdataview_pages\b/ig.test(v)) {
                        query = v.replace(/\bdataview_pages\b/ig, '$0');
                        dataTable = Array.from(getAPI(this._plugin.app).index.pages.values());
                        // } else if (/\bdataview_pages_map\b/ig.test(v)) {
                        //     query = v.replace(/\bdataview_pages_map\b/ig, '?');
                        //     dataTable = getAPI(this._plugin.app).index.pages;
                    }
                    this.logger.logWithId(this._queryId, 'query:', query);

                    queryResult = alasql(query, [dataTable])
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
            queryResult = new Array();
        }
        this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length}`, queryResult);
        return queryResult;
    }

    /**
     * This is the public entry point for the tasks rendering, it will
     * call the internal function to get tasks and then handle the
     * update of the grouping so groups will render correctly.
     *
     * @param {Task[]} tasks
     * @return {*}  {TaskGroups}
     * @memberof QuerySql
     */
    public applyQuery(): any {
        const queryResult: any = this.query();

        return queryResult;
    }

    public explainQuery(): string {
        return 'Explanation of this Tasks SQL code block query:\n\n';
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
        const randomArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);

        const randomString = randomArray.join('');
        return randomString;
    }


}

