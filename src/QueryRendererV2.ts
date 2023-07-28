/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {micromark} from 'micromark';
import {gfm, gfmHtml} from 'micromark-extension-gfm';
import {html as wikiHtml, syntax as wiki} from 'micromark-extension-wiki-link';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toString} from 'mdast-util-to-string';
import {fromMarkdown as fromWiki} from 'mdast-util-wiki-link';
import {type MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild, Plugin, debounce} from 'obsidian';
import {QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {DateTime} from 'luxon';
import {useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';

export interface IRenderingSettings {
  postRenderFormat: string;
  enableExperimentalRender: boolean;
}

export const RenderingSettingsDefaults: IRenderingSettings = {
  postRenderFormat: 'micromark',
  enableExperimentalRender: false,
};

/**
 * This service handles the registration of the code block processor for QATT. So
 * when the block is processed Obsidian will call the code block processor registered
 * here and a new render child will be created and registered. When the block
 * is changed or navigated away from the render child will be unloaded.
 *
 * @export
 * @class QueryRendererV2Service
 * @extends {Service}
 */
export class QueryRendererV2Service extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.QueryRendererV2Service');
  lastCreation: DateTime;
  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    RenderingSettingsDefaults,
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Settings Update - postRenderFormat', settings);
      this.postRenderFormat = settings.postRenderFormat;
    },
  );

  postRenderFormat = RenderingSettingsDefaults.postRenderFormat;

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;
    tab.field().setName('Rendering Settings').setHeading();
    const addNew = tab.field()
      .setName('Default Post Render Format')
      .addText(text => {
        const onChange = async (value: string) => {
          await settings.update(RenderingSettings => {
            RenderingSettings.postRenderFormat = value;
          });
        };

        text.setPlaceholder('micromark')
          .setValue(this.postRenderFormat)
          .onChange(debounce(onChange, 500, true));
      });

    tab.field();
  }

  async onload() {
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) => {
      this.logger.info(`lastCreation ${this.lastCreation.toISO() ?? ''}`);
      this.logger.debug(`Adding QATT Render for ${source} to context ${context.docId}`);

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

/**
 * All the rendering logic is handled here. It uses ths configuration to
 * determine the rendering engine and the query engine.
 *
 * @export
 * @class QueryRenderChildV2
 * @extends {MarkdownRenderChild}
 */
export class QueryRenderChildV2 extends MarkdownRenderChild {
  public container: HTMLElement;
  public queryConfiguration: QattCodeBlock;
  public context: MarkdownPostProcessorContext;
  public service: QueryRendererV2Service;

  plugin: Plugin;
  logger: Logger;
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
    this.logger = service.use(LoggingService).getLogger('Qatt.QueryRenderChildV2');
    this.queryFactory = service.use(QueryFactory);
    this.renderFactory = service.use(RenderFactory);
  }

  onload() {
    this.renderId = `${this.queryConfiguration.id}:${this.context.sourcePath}`;
    if (this.queryConfiguration.logLevel) {
      this.logger.setLogLevel(this.queryConfiguration.logLevel);
    }

    this.logger.infoWithId(this.renderId, `Query Render generated for class ${this.container.className} -> ${this.queryConfiguration.queryDataSource}`);

    if (this.queryConfiguration.queryDataSource === 'qatt') {
      this.registerEvent(this.plugin.app.workspace.on('qatt:notes-store-update', this.render));
    }

    if (this.queryConfiguration.queryDataSource === 'dataview') {
      this.registerEvent(this.plugin.app.workspace.on('qatt:dataview-store-update', this.render));
    }

    // Old event
    // this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', this.render));

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

    // Get the engine to render the results to HTML.
    const renderEngine: IRenderer = this.renderFactory.getRenderer(this.queryConfiguration);

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

    // Replace the content of the container with the new content.
    this.container.firstChild?.replaceWith(content);

    // If we are debugging add the render ID to the top of the div to make
    // tracing simpler.
    if (this.queryConfiguration.logLevel === 'debug') {
      const debugWrapper = this.container.createEl('sub');
      debugWrapper.className = 'qatt-render-debugWrapper';
      debugWrapper.innerHTML = `RenderID: ${this.renderId}`;
      content.prepend(debugWrapper);
    }

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
}
