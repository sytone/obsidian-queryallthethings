import { IQuery } from 'IQuery';
import { LayoutOptions } from 'LayoutOptions';
import { isFeatureEnabled } from 'Settings/Settings';
import alasql from 'alasql';
import { logging } from 'lib/logging';
import { parse } from 'yaml'


export class QuerySql implements IQuery {
    public source: string;
    public name: string;

    // @ts-ignore
    private _sourcePath: string;
    // @ts-ignore
    private _frontmatter: any | null | undefined;

    private _layoutOptions: LayoutOptions = new LayoutOptions();

    private _error: string | undefined = undefined;
    // private _groupingPossible: boolean = false;
    // private _groupByFields: [string, string][] = [];
    private _rawMode: boolean = false;
    private _rawWithTasksMode: boolean = false;
    private _multilineQueryMode: boolean = false;
    private _rawResults: any;

    logger = logging.getLogger('tasks.QuerySql');

    // Directives
    // These are used to control the settings of the query and task output.
    private _commentRegexp = /^#.*/;
    private _commentReplacementRegexp = /(^#.*$(\r\n|\r|\n)?)/gm;
    private _customJSRegexp = /^customjs (.*) (.*)/;
    private _customTemplateRegexp = /^template (.*)/;
    private _multilineQueryRegexp = /^(multiline|ml)/;
    private _rawQuery = /^raw (empty|tasks)/;
    private _shortModeRegexp = /^short/;

    // Pending a future PR to enable Custom JS again.
    private _customJsClasses: Array<[string, string]>;
    private _customTemplate: string = '';

    // Used internally to uniquely log each query execution in the console.
    private _queryId: string = '';

    /**
     * This prefix is added to any query unless #raw empty is used.
     *
     * @private
     * @memberof QuerySql
     */
    private readonly defaultQueryPrefix = 'SELECT * FROM ?';

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
    }: {
        source: string;
        sourcePath: string;
        frontmatter: any | null | undefined;
    }) {
        this.name = 'QuerySql';
        this._queryId = this.generateQueryId(10);

        this._sourcePath = sourcePath;
        this._frontmatter = frontmatter;
        this.logger.debugWithId(this._queryId, 'Source Path', this._sourcePath);
        this.logger.debugWithId(this._queryId, 'Source Front Matter', this._frontmatter);

        // Pending a future PR to enable Custom JS again.
        this._customJsClasses = [];
        const queryConfiguration = parse(source);

        // Process the query to pull out directives and comments.
        this.processDirectivesAndComments(source);

        // Remove all the comments from the query.
        this.source = queryConfiguration.query; //source.replace(this._commentReplacementRegexp, '').trim();
        this.logger.infoWithId(this._queryId, 'Source Query', this.source);
        this.logger.infoWithId(this._queryId, 'queryConfiguration', queryConfiguration);

        // If this is multiline then only the last query should have the prefix.
        if (this._multilineQueryMode) {
            this.setPrefixForMultilineQuery();
        } else {
            if (!this.source.includes('SELECT')) {
                // this.source = `${this.defaultQueryPrefix} ${this.source}`;
            }
        }

        // Exit out if raw with no set table to query. This is '#raw empty'.
        if (this._rawMode && !this._rawWithTasksMode) {
            this.logger.debugWithId(this._queryId, 'RAW mode without tasks as data source');
            return;
        }

        // If there is a group by clause, then we can do grouping later on, no need to
        // use the existing filters in current grouping classes.
        // if (/(^|\s)GROUP BY*/gim.test(this.source)) {
        //     this._groupingPossible = true;
        // }
        // this.logger.debugWithId(this._queryId, 'Grouping Possible', this._groupingPossible);

        // const sqlTokens = this.source.match(/[^\s,;]+|;/gi);

        // if (this._groupingPossible && sqlTokens !== null) {
        //     this.parseGroupingDetails(sqlTokens);
        // }
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

        // If the '# raw' command is added to the query then we will return the raw
        // query results, allows more advanced based query results. The information
        // is returned to the console currently. Independent rendering is a TBD.
        if (this._rawMode && !this._rawWithTasksMode) {
            let rawResult;

            // This query will use tasks to query against.
            try {
                if (this._multilineQueryMode) {
                    rawResult = alasql(this.source).slice(-1)[0];
                } else {
                    rawResult = alasql(this.source);
                }
            } catch (error) {
                this._error = `Error with query: ${error}`;
                this.logger.errorWithId(this._queryId, 'Error with query', error);
            }
            this.logger.infoWithId(this._queryId, 'RAW SQL Query Results:', rawResult);
            this._rawResults = rawResult;

            // Return a empty array of Tasks as output is on console.
            rawResult = new Array();
            this._error = 'To view results please open the console.';

            return rawResult.map((task) => {
                return task;
            });
        }

        // Direct tasks uses the Task object and not TaskRecord so less conversion/overhead.
        // This does make the object slightly more complex than the flattened version, updates
        // to the Task object to expose get properties would help here and possibly in the
        // filters for consistency.
        // Further perf options are to have a database in memory with all the tasks in it and
        // then update the db on a change event like the current cache with references to the
        // tasks.
        // By default direct should be used as it is faster.
        let queryResult: any;

        try {
            if (this._multilineQueryMode) {
                queryResult = alasql(this.source, []).slice(-1)[0];
            } else {
                queryResult = alasql(this.source, []);
            }
        } catch (error) {
            this._error = `Error with query: ${error}`;
            this.logger.errorWithId(this._queryId, 'Error with query', error);
            queryResult = new Array();
        }
        if (this._rawMode && this._rawWithTasksMode) {
            this.logger.infoWithId(this._queryId, 'RAW SQL Query Results with Tasks as data:', queryResult);
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
     * Processes all the lines in the query for directives and comments
     *
     * @private
     * @param {string} source
     * @memberof QuerySql
     */
    private processDirectivesAndComments(source: string) {
        let queryValue = '';
        source
            .split('\n')
            .map((line: string) => line.trim())
            .forEach((line: string) => {
                this.logger.debugWithId(this._queryId, 'Line to process:', line);
                switch (true) {
                    case line === '':
                        break;
                    case line.includes('query:'):
                        queryValue += line.replace('query:', '');
                        break;
                    case this._commentRegexp.test(line):
                        this.processQueryDirectivesAndComments(line);
                        break;
                }
            });
    }

    /**
     * For a multiline query break it up into an array and set prefix on last query.
     *
     * @private
     * @return {void}
     * @memberof QuerySql
     */
    private setPrefixForMultilineQuery(): void {
        const multilineQuery = this.source
            .split(';')
            .filter((element) => element)
            .map((line: string) => line.trim());

        const lastQuery: string = multilineQuery[multilineQuery.length - 1];
        // Add the select prefix to the last query only.
        if (!lastQuery.includes('SELECT')) {
            multilineQuery[multilineQuery.length - 1] = `${this.defaultQueryPrefix} ${multilineQuery[multilineQuery.length - 1]
                }`;
        }
        this.source = multilineQuery.join(';');
    }
    /**
     * This function processes query directives and comments in a given line of
     * code.
     *
     * @private
     * @param {string} line - A string representing a line of code that may
     * contain directives or comments.
     * @memberof QuerySql
     */
    private processQueryDirectivesAndComments(line: string): void {
        const directive = line.slice(1).trim();
        switch (true) {
            case this._shortModeRegexp.test(directive):
                this._layoutOptions.shortMode = true;
                break;
            case LayoutOptions.hideOptionsRegexp.test(directive):
                this.parseHideOptions({ line: directive });
                break;
            case this._rawQuery.test(directive):
                this.parseRawOptions(directive);
                break;
            case this._multilineQueryRegexp.test(directive):
                this.parseMultilineOptions(directive);
                break;
            case this._customJSRegexp.test(directive):
                this.parseCustomJSPluginOptions(directive);
                break;
            case this._customTemplateRegexp.test(directive):
                this.parseCustomTemplateOptions(directive);
                break;
        }
    }

    /**
     * Search for #template <template>. Functionality is pending future PR.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseCustomTemplateOptions(directive: string) {
        if (isFeatureEnabled('ENABLE_INLINE_TEMPLATE')) {
            const customTemplate = directive.match(this._customTemplateRegexp);
            if (customTemplate !== null && customTemplate[1].trim() !== '') {
                this._customTemplate = customTemplate[1].trim();
            }
        }
    }

    /**
     * Allow custom functions to be available in the SQL query via the CustomJS
     * plugin. Functionality is pending future PR.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseCustomJSPluginOptions(directive: string) {
        const customJSClasses = directive.match(this._customJSRegexp);
        if (customJSClasses !== null && customJSClasses[1].trim() !== '' && customJSClasses[2].trim() !== '') {
            this._customJsClasses.push([customJSClasses[1].trim(), customJSClasses[2].trim()]);
        }
    }

    /**
     *  Multiline mode directs the processing to only take the last array, if
     *  you are running raw mode and want all the output of the commands this
     *  can be skipped.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseMultilineOptions(directive: string) {
        this.logger.debugWithId(this._queryId, 'Detected multiline directive', directive);
        this._multilineQueryMode = true;
    }

    /**
     * Parses the raw options to allow customized queries and debugging via console.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseRawOptions(directive: string) {
        this.logger.debugWithId(this._queryId, 'Detected RAW mode directive: ', directive);
        this._rawMode = true;
        const rawOptions = directive.match(this._rawQuery);
        this.logger.debugWithId(this._queryId, 'rawOptions: ', JSON.stringify(rawOptions));

        if (rawOptions !== null && rawOptions[1].trim().toLowerCase() === 'empty') {
            this._rawWithTasksMode = false;
        } else {
            this._rawWithTasksMode = true;
        }
        this.logger.debugWithId(this._queryId, 'Set _rawWithTasksMode to: ', this._rawWithTasksMode);
    }

    /**
     * Parses the common layout options for the tasks plugin.
     *
     * @private
     * @param {{ line: string }} { line }
     * @memberof QuerySql
     */
    private parseHideOptions({ line }: { line: string }): void {
        this._layoutOptions.parseLayoutOptions({ line });
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

