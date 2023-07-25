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

export class QueryRendererV2Service extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService);

  async onload() {
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) => {
      this.logger.info(`Adding SQL Query Render for ${source} to context ${context.docId}`);

      // Need to move back to this.
      // const render = this.use.fork().use(QueryRenderChild);
      // render.container = element;
      // render.queryConfiguration = new QattCodeBlock(source);
      // render.context = context;
      // render.load();

      // Need to move back to this.
      const queryConfiguration = new QattCodeBlock(source);
      context.addChild(
        new QueryRenderChildV2(
          element,
          queryConfiguration,
          context,
          this,
        ),
      );
    });
  }
}

export class QueryRenderChildV2 extends MarkdownRenderChild {
  public container: HTMLElement;
  public queryConfiguration: QattCodeBlock;
  public context: MarkdownPostProcessorContext;
  public service: QueryRendererV2Service;

  plugin: Plugin;
  logger: LoggingService;
  queryFactory: QueryFactory;
  renderFactory: RenderFactory;

  private renderId: string;

  public constructor(
    container: HTMLElement,
    queryConfiguration: QattCodeBlock,
    context: MarkdownPostProcessorContext,
    service: QueryRendererV2Service) {
    super(container);
    this.container = container;
    this.queryConfiguration = queryConfiguration;
    this.context = context;
    this.service = service;

    // If I use 'use' at the top of this class then it throws
    // an error that there is no context available. This class
    // cannot extend Service.
    this.plugin = service.use(Plugin);
    this.logger = service.use(LoggingService);
    this.queryFactory = service.use(QueryFactory);
    this.renderFactory = service.use(RenderFactory);
  }

  onload() {
    this.renderId = this.generateRenderId(10);
    if (this.queryConfiguration.logLevel) {
      this.logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this.logger.infoWithId(this.renderId, `Query Render generated for class ${this.container.className} -> ${this.container.className}`);

    this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', this.render));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.render();
  }

  onunload() {
    // Unload resources
    this.logger.infoWithId(this.renderId, `QueryRenderChild unloaded for ${this.renderId}`);
  }

  render = async () => {
    this.logger.groupId(this.renderId);
    const startTime = new Date(Date.now());

    // Run query and get results to be rendered
    const queryEngine: IQuery = this.queryFactory.getQuery(this.queryConfiguration, this.context.sourcePath, this.context.frontmatter, this.renderId);
    const results = queryEngine.applyQuery(this.renderId);

    const renderEngine: IRenderer = this.renderFactory.getRenderer(this.queryConfiguration);

    const testWrapper = this.container.createEl('div');
    testWrapper.innerHTML = `RenderID: ${this.renderId}`;

    const content = this.container.createEl('div');
    content.setAttr('data-query-id', this.renderId);

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
    this.container.prepend(testWrapper);
    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    this.logger.groupEndId();
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

  /**
   * Creates a unique ID for correlation of console logging.
   *
   * @private
   * @param {number} length
   * @return {*}  {string}
   * @memberof QuerySql
   */
  private generateRenderId(length: number): string {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]);

    const randomString = randomArray.join('');
    return randomString;
  }
}
