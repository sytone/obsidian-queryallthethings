import handlebars  from 'handlebars';
import { IQuery } from 'IQuery';
import { QuerySql } from 'QuerySql';
import { logging } from 'lib/logging';
import { App, MarkdownPostProcessorContext, MarkdownRenderChild, Plugin } from 'obsidian';



export class QueryRenderer {
    public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);
    _logger = logging.getLogger('qatt.QueryRenderer');

    private readonly app: App;

    constructor({ plugin }: { plugin: Plugin; }) {
        this.app = plugin.app;
        plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
    }

    private async _addQuerySqlRenderChild(source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
        this._logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);
        context.addChild(
            new QueryRenderChild({
                app: this.app,
                container: element,
                queryEngine: new QuerySql({ source, sourcePath: context.sourcePath, frontmatter: context.frontmatter }),
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly queryEngine: IQuery;
    private readonly app: App;
    _logger = logging.getLogger('qatt.QueryRenderChild');
    private queryReloadTimeout: NodeJS.Timeout | undefined;

    constructor({
        app,
        container,
        queryEngine,
    }: {
        app: App;
        container: HTMLElement;
        queryEngine: IQuery;
    }) {
        super(container);

        this.app = app;
        this.queryEngine = queryEngine;

        this._logger.debug(`Query Render generated for class ${this.containerEl.className}`);
    }

    onload() {
        // This allows tracing of unique query renders through the plugin.
        const startTime = new Date(Date.now());
        const content = this.containerEl.createEl('div');
        content.setAttr('data-query-id', 'sss');

        const results = this.queryEngine.applyQuery('sss');

        var template = handlebars.compile("Handlebars {{result}}");
        const html = template({result: results});
        this._logger.info('queryConfiguration', results);


        if (this.queryEngine.error === undefined) {
            content.setText(html);
        } else if (this.queryEngine.error !== undefined) {
            this._logger.error(`Tasks query (${this.queryEngine.name}) error: ${this.queryEngine.error}`);
            content.setText(`Tasks query error: ${this.queryEngine.error}`);
        } else {
            content.setText('Loading Tasks ...');
        }

        this.containerEl.firstChild?.replaceWith(content);
        const endTime = new Date(Date.now());
        this._logger.debugWithId('sss', `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
        this.reloadQueryAtMidnight();
    }

    onunload() {
        if (this.queryReloadTimeout !== undefined) {
            clearTimeout(this.queryReloadTimeout);
        }
    }

    /**
     * Reloads the query after midnight to update results from relative date queries.
     *
     * For example, the query `due today` changes every day. This makes sure that all query results
     * are re-rendered after midnight every day to ensure up-to-date results without having to
     * reload obsidian. Creating a new query object from the source re-applies the relative dates
     * to "now".
     */
    private reloadQueryAtMidnight(): void {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const now = new Date();

        const millisecondsToMidnight = midnight.getTime() - now.getTime();

        this.queryReloadTimeout = setTimeout(() => {
            this.reloadQueryAtMidnight();
        }, millisecondsToMidnight + 1000); // Add buffer to be sure to run after midnight.
    }

    // private async render() {
    //     // This allows tracing of unique query renders through the plugin.
    //     const startTime = new Date(Date.now());
    //     //Old: Date.now() + Math.random().toString(36).slice(2, 9);
    //     const queryId = this.queryEngine.sourceHash;

    //     const content = this.containerEl.createEl('div');
    //     content.setAttr('data-query-id', queryId);

    //     if (this.queryEngine.error === undefined) {

    //     } else if (this.queryEngine.error !== undefined) {
    //         this._logger.error(`Tasks query (${this.queryEngine.name}) error: ${this.queryEngine.error}`);
    //         content.setText(`Tasks query error: ${this.queryEngine.error}`);
    //     } else {
    //         content.setText('Loading Tasks ...');
    //     }

    //     this.containerEl.firstChild?.replaceWith(content);
    //     const endTime = new Date(Date.now());
    //     this._logger.debugWithId(queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    // }

}
