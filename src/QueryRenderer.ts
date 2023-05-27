import { IQuery } from 'Interfaces/IQuery';
import { QuerySql } from 'QuerySql';
import { logging } from 'lib/logging';
import { App, MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild } from 'obsidian';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { QattCodeBlock } from 'QattCodeBlock';
import { IRenderer } from 'render/IRenderer';
import { RenderFactory } from 'render/RenderFactory';
import { QueryFactory } from 'querier/QueryFactory';

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

    const queryConfiguration = new QattCodeBlock(source);
    context.addChild(
      new QueryRenderChild(
        this.plugin,
        element,
        queryConfiguration,
        context.sourcePath,
        context.frontmatter
      )
    );
  }
}

class QueryRenderChild extends MarkdownRenderChild {
  _logger = logging.getLogger('Qatt.QueryRenderChild');

  private readonly queryId: string;

  constructor (
    private plugin: IQueryAllTheThingsPlugin,
    private container: HTMLElement,
    private queryConfiguration: QattCodeBlock,
    private sourcePath: string,
    private frontmatter: any
  ) {
    super(container);
    this.queryId = 'TBD';
    if (this.queryConfiguration.logLevel) {
      this._logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this._logger.debug(`Query Render generated for class ${this.containerEl.className} -> ${this.container}`);
  }

  onload () {
    this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', this.render));
    this.render();
  }

  onunload () {
  }

  render = async () => {
    const startTime = new Date(Date.now());

    // Run query and get results to be rendered
    const queryEngine: IQuery = QueryFactory.getQuery(this.queryConfiguration, this.sourcePath, this.frontmatter, this.plugin);
    const results = queryEngine.applyQuery(this.queryId);

    const renderEngine: IRenderer = RenderFactory.getRenderer(this.queryConfiguration);

    const content = this.containerEl.createEl('div');
    content.setAttr('data-query-id', this.queryId);

    if (queryEngine.error) {
      content.setText(`QATT query error: ${queryEngine.error}`);
    } else {
      // Render Engine Execution
      const html = renderEngine?.renderTemplate(results) ?? 'Unknown error or exception has occurred.';
      this._logger.debug('Render Results', html);

      if (this.queryConfiguration.postRenderFormat === 'markdown') {
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
