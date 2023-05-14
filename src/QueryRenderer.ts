import handlebars from 'handlebars';
import { parse } from 'yaml'
import { IQuery } from 'Interfaces/IQuery';
import { QuerySql } from 'QuerySql';
import { logging } from 'lib/logging';
import { App, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer } from 'obsidian';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';

export class QueryRenderer {
    public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);
    _logger = logging.getLogger('qatt.QueryRenderer');

    private readonly _app: App;
    private readonly _plugin: IQueryAllTheThingsPlugin;

    constructor({ plugin }: { plugin: IQueryAllTheThingsPlugin; }) {
        this._app = plugin.app;
        this._plugin = plugin;
        plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
    }

    private async _addQuerySqlRenderChild(source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
        this._logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);
        context.addChild(
            new QueryRenderChild({
                app: this._app,
                container: element,
                source: source,
                queryEngine: new QuerySql({
                    source,
                    sourcePath: context.sourcePath,
                    frontmatter: context.frontmatter,
                    plugin: this._plugin
                }),
            }),
        );
    }
}

class QueryRenderChild extends MarkdownRenderChild {
    private readonly queryEngine: IQuery;
    private readonly app: App;
    private readonly source: string;
    _logger = logging.getLogger('qatt.QueryRenderChild');
    private readonly queryId: string;
    private queryReloadTimeout: NodeJS.Timeout | undefined;

    constructor({
        app,
        container,
        source,
        queryEngine,
    }: {
        app: App;
        container: HTMLElement;
        source: string;
        queryEngine: IQuery;
    }) {
        super(container);

        this.app = app;
        this.queryEngine = queryEngine;
        this.source = source;
        this.queryId = 'TBD'

        this._logger.debug(`Query Render generated for class ${this.containerEl.className}`);

        handlebars.registerHelper('stringify', function (value) {
            return JSON.stringify(value, null, 2);
        })


    }

    onload() {
        this.registerEvent(this.app.workspace.on("qatt:refresh-codeblocks", this.render));
        this.render();
    }

    onunload() {
        if (this.queryReloadTimeout !== undefined) {
            clearTimeout(this.queryReloadTimeout);
        }
    }

    render = () => {
        const startTime = new Date(Date.now());

        const renderConfiguration = parse(this.source);
        const results = this.queryEngine.applyQuery(this.queryId);
        this._logger.info('queryConfiguration', results);

        let template = handlebars.compile("{{stringify result}}");
        if (renderConfiguration.template !== undefined) {
            template = handlebars.compile(renderConfiguration.template);
        }
        const html = template({ result: results });

        const content = this.containerEl.createEl('div');
        content.setAttr('data-query-id', this.queryId);

        if (this.queryEngine.error === undefined) {
            if (renderConfiguration.render == 'markdown') {
                MarkdownRenderer.renderMarkdown(html, content, '', this);
            } else {
                content.innerHTML = html;
            }
        } else if (this.queryEngine.error !== undefined) {
            this._logger.error(`QATT query (${this.queryEngine.name}) error: ${this.queryEngine.error}`);
            content.setText(`QATT query error: ${this.queryEngine.error}`);
        } else {
            content.setText('Loading...');
        }

        this.containerEl.firstChild?.replaceWith(content);
        const endTime = new Date(Date.now());
        this._logger.debugWithId(this.queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    }

}
