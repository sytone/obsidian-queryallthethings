/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {micromark} from 'micromark';
import {gfm, gfmHtml} from 'micromark-extension-gfm';
import {html as wikiHtml, syntax as wiki} from 'micromark-extension-wiki-link';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toString} from 'mdast-util-to-string';
import {fromMarkdown as fromWiki} from 'mdast-util-wiki-link';
import {type MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild, Plugin} from 'obsidian';
import {QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';
import {Service, use} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';

export class QueryRendererService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService);

  public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);

  constructor(
  ) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
  }

  private async _addQuerySqlRenderChild(source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
    this.logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);

    const render = this.use.fork().use(QueryRenderChild);
    render.container = element;
    render.queryConfiguration = new QattCodeBlock(source);
    render.context = context;
    render.load();

    // Context.addChild(
    //   new QueryRenderChild(
    //     element,
    //     queryConfiguration,
    //     context,
    //   ),
    // );
  }
}

export class QueryRenderChild extends Service {
  public container: HTMLElement;
  public queryConfiguration: QattCodeBlock;
  public context: MarkdownPostProcessorContext;

  plugin = this.use(Plugin);
  logger = this.use(LoggingService);
  queryFactory = this.use(QueryFactory);

  private readonly queryId: string;

  constructor(
  ) {
    super();
    this.queryId = 'TBD';
  }

  onload() {
    if (this.queryConfiguration.logLevel) {
      this.logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this.logger.debug(`Query Render generated for class ${this.container.className} -> ${this.container.className}`);

    this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', this.render));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.render();
  }

  onunload() {
    // Unload resources
  }

  render = async () => {
    const startTime = new Date(Date.now());

    // Run query and get results to be rendered
    const queryEngine: IQuery = this.queryFactory.getQuery(this.queryConfiguration, this.context.sourcePath, this.context.frontmatter);
    const results = queryEngine.applyQuery(this.queryId);

    const renderEngine: IRenderer = RenderFactory.getRenderer(this.queryConfiguration);

    const content = this.container.createEl('div');
    content.setAttr('data-query-id', this.queryId);

    if (queryEngine.error) {
      content.setText(`QATT query error: ${queryEngine.error}`);
    } else {
      // Render Engine Execution
      const html = renderEngine?.renderTemplate(results) ?? 'Unknown error or exception has occurred.';
      this.logger.debug('Render Results', html);

      const postRenderFormat = this.queryConfiguration.postRenderFormat ?? this.plugin.settingsManager?.getValue('postRenderFormat');
      this.logger.debug('postRenderFormat: ', postRenderFormat);

      if (postRenderFormat === 'markdown') {
        await MarkdownPreviewView.renderMarkdown(html, content, '', this.plugin);
      } else if (postRenderFormat === 'micromark') {
        this.logger.debug('micromark Render Results', this.markdown2html(html));
        content.innerHTML = this.markdown2html(html);
      } else {
        content.innerHTML = html;
      }
    }

    this.container.firstChild?.replaceWith(content);
    const endTime = new Date(Date.now());
    this.logger.debug(this.queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
  };

  markdown2html(markdown?: string): string {
    if (markdown === undefined || markdown === null) {
      return '';
    }

    const html = micromark(markdown, {
      allowDangerousHtml: true,
      extensions: [
        wiki({aliasDivider: '|'}),
        gfm(),
      ],
      htmlExtensions: [
        wikiHtml({
          permalinks: [],
          wikiLinkClassName: 'internal-link data-link-icon data-link-icon-after data-link-text',
          hrefTemplate: (permalink: string) => `${permalink}`,
          pageResolver: (name: string) => [name],
        }),
        gfmHtml(),
      ],
    });

    return html;
  }

  markdown2text(markdown?: string): string {
    if (markdown === undefined || markdown === null) {
      return '';
    }

    const tree = fromMarkdown(markdown, {
      extensions: [wiki()],
      mdastExtensions: [fromWiki()],
    });
    return toString(tree);
  }
}
