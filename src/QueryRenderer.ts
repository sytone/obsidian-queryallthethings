/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {micromark} from 'micromark';
import type {Extension, HtmlExtension} from 'micromark-util-types';
import {gfm, gfmHtml} from 'micromark-extension-gfm';
import {html as wikiHtml, syntax as wiki} from 'micromark-extension-wiki-link';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toString} from 'mdast-util-to-string';
import {fromMarkdown as fromWiki} from 'mdast-util-wiki-link';
import {logging} from 'lib/Logging';
import {type MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild} from 'obsidian';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'render/IRenderer';
import {RenderFactory} from 'render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';

export class QueryRenderer {
  public addQuerySqlRenderChild = this._addQuerySqlRenderChild.bind(this);
  _logger = logging.getLogger('Qatt.QueryRenderer');

  constructor(
    private readonly plugin: IQueryAllTheThingsPlugin,
  ) {
    plugin.registerMarkdownCodeBlockProcessor('qatt', this._addQuerySqlRenderChild.bind(this));
  }

  private async _addQuerySqlRenderChild(source: string, element: HTMLElement, context: MarkdownPostProcessorContext) {
    this._logger.debug(`Adding SQL Query Render for ${source} to context ${context.docId}`);

    const queryConfiguration = new QattCodeBlock(source);
    context.addChild(
      new QueryRenderChild(
        this.plugin,
        element,
        queryConfiguration,
        context,
      ),
    );
  }
}

class QueryRenderChild extends MarkdownRenderChild {
  _logger = logging.getLogger('Qatt.QueryRenderChild');

  private readonly queryId: string;

  constructor(
    private readonly plugin: IQueryAllTheThingsPlugin,
    private readonly container: HTMLElement,
    private readonly queryConfiguration: QattCodeBlock,
    private readonly context: MarkdownPostProcessorContext,
  ) {
    super(container);
    this.queryId = 'TBD';
    if (this.queryConfiguration.logLevel) {
      this._logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this._logger.debug(`Query Render generated for class ${this.containerEl.className} -> ${this.container.className}`);
  }

  onload() {
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
    const queryEngine: IQuery = QueryFactory.getQuery(this.queryConfiguration, this.context.sourcePath, this.context.frontmatter, this.plugin);
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
      console.log(micromark('## Hello, *world*!'));

      if (this.queryConfiguration.postRenderFormat === 'markdown') {
        await MarkdownPreviewView.renderMarkdown(html, content, '', this.plugin);
      } else if (this.queryConfiguration.postRenderFormat === 'micromark') {
        this._logger.debug('micromark Render Results', this.md2html(html));
        const options = {allowDangerousHtml: true, allowDangerousProtocol: true, extensions: [gfm()], htmlExtensions: [gfmHtml()]};

        content.innerHTML = this.md2html(html);
      } else {
        content.innerHTML = html;
      }
    }

    this.containerEl.firstChild?.replaceWith(content);
    const endTime = new Date(Date.now());
    this._logger.debugWithId(this.queryId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
  };

  md2html(md?: string, isInline = false): string {
    if (md === null) {
      return '';
    }

    const html = micromark(md, {
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

    if (isInline && !md?.includes('\n\n')) {
      return html.replace(/<p>|<\/p>/g, '');
    }

    return html;
  }

  md2text(md?: string): string {
    if (md === null) {
      return '';
    }

    const tree = fromMarkdown(md, {
      extensions: [wiki()],
      mdastExtensions: [fromWiki()],
    });
    return toString(tree);
  }
}
