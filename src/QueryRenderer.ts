import handlebars from 'handlebars';
import { parse } from 'yaml';
import { IQuery } from 'Interfaces/IQuery';
import { QuerySql } from 'QuerySql';
import { logging } from 'lib/logging';
import { App, MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild } from 'obsidian';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';

export class QueryRenderer {
  public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);
  _logger = logging.getLogger('Qatt.QueryRenderer');

  private readonly _app: App;

  constructor (
    private plugin: IQueryAllTheThingsPlugin
  ) {
    this._app = plugin.app;
    plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
  }

  private async _addQuerySqlRenderChild (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
    this._logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);
    context.addChild(
      new QueryRenderChild(
        this._app,
        this.plugin,
        element,
        source,
        new QuerySql(
          source,
          context.sourcePath,
          context.frontmatter,
          this.plugin
        )
      )
    );
  }
}

class QueryRenderChild extends MarkdownRenderChild {
  private readonly queryId: string;
  // private queryReloadTimeout: NodeJS.Timeout | undefined;

  _logger = logging.getLogger('Qatt.QueryRenderChild');

  constructor (
    private app: App,
    private plugin: IQueryAllTheThingsPlugin,
    private container: HTMLElement,
    private source: string,
    private queryEngine: IQuery
  ) {
    super(container);
    this.queryId = 'TBD';
    this._logger.debug(`Query Render generated for class ${this.containerEl.className} -> ${this.container}`);
    handlebars.registerHelper('stringify', function (value) {
      return JSON.stringify(value, null, 2);
    });
  }

  onload () {
    this.registerEvent(this.app.workspace.on('qatt:refresh-codeblocks', this.render));
    this.render();
  }

  onunload () {
    // if (this.quezzryReloadTimeout !== undefined) {
    //   clearTimeout(this.queryReloadTimeout);
    // }
  }

  render = async () => {
    const startTime = new Date(Date.now());

    const renderConfiguration = parse(this.source);
    const results = this.queryEngine.applyQuery(this.queryId);
    this._logger.info('queryConfiguration', results);

    const template = handlebars.compile(renderConfiguration.template ?? '{{stringify result}}');

    const content = this.containerEl.createEl('div');
    content.setAttr('data-query-id', this.queryId);

    if (this.queryEngine.error) {
      this._logger.error(`QATT query (${this.queryEngine.name}) error: ${this.queryEngine.error}`);
      content.setText(`QATT query error: ${this.queryEngine.error}`);
    } else {
      const html = template({ result: results });
      if (renderConfiguration.render === 'markdown') {
        await MarkdownPreviewView.renderMarkdown(html, content, '', this.plugin);
      } else {
        content.innerHTML = html;
      }
    }

    this.containerEl.firstChild?.replaceWith(content);
    const endTime = new Date(Date.now());
    this._logger.debugWithId(this.queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
  };
}
