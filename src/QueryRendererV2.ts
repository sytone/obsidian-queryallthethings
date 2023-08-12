
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
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {markdown2html} from 'Render/MicromarkRenderer';

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
      this.logger.info('QueryRendererV2Service Updated Settings');
      this.postRenderFormat = settings.postRenderFormat;
    },
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Initialize Settings');
      this.postRenderFormat = settings.postRenderFormat;
    },
  );

  postRenderFormat: string;

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;

    const settingsSection = tab.addHeading(new SettingsTabHeading({text: 'Rendering Settings', level: 'h2', class: 'settings-heading'}));

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.postRenderFormat = value;
      });
    };

    const postRenderSetting = tab.addDropdownInput(
      new SettingsTabField({
        name: 'Default Post Render Format',
        description: 'Once the template has finished rendering the final output needs to be HTML. If the template returns markdown then it needs to be converted, this settings allows you to select the default processor so you do not have to set it in each codeblock.',
        placeholder: {
          markdown: 'Obsidian Markdown',
          micromark: 'Micromark',
          none: 'None',
        },
        value: this.postRenderFormat,
      }),
      onChange,
      settingsSection,
    );
  }

  async onload() {
    this.plugin.registerMarkdownCodeBlockProcessor('qatt', (source: string, element: HTMLElement, context: MarkdownPostProcessorContext) => {
      this.logger.info(`lastCreation ${this.lastCreation.toISO() ?? ''}`);
      this.logger.debug(`Adding QATT Render for ${source} to context ${context.docId}`);

      const codeblockConfiguration = new QattCodeBlock(source);
      context.addChild(
        new QueryRenderChildV2(
          element,
          codeblockConfiguration,
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
  public codeblockConfiguration: QattCodeBlock;
  public context: MarkdownPostProcessorContext;
  public service: QueryRendererV2Service;

  plugin: Plugin;
  logger: Logger;
  queryFactory: QueryFactory;
  renderFactory: RenderFactory;

  private renderId: string;

  public constructor(
    container: HTMLElement,
    codeblockConfiguration: QattCodeBlock,
    context: MarkdownPostProcessorContext,
    service: QueryRendererV2Service) {
    super(container);
    this.container = container;
    this.codeblockConfiguration = codeblockConfiguration;
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
    this.renderId = `${this.codeblockConfiguration.id}:${this.context.sourcePath}`;
    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    this.logger.infoWithId(this.renderId, `Query Render generated for class ${this.container.className} -> ${this.codeblockConfiguration.queryDataSource}`);

    if (this.codeblockConfiguration.queryDataSource === 'qatt') {
      this.registerEvent(this.plugin.app.workspace.on('qatt:notes-store-update', this.render));
    }

    if (this.codeblockConfiguration.queryDataSource === 'dataview') {
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

    // Query
    // Run query and get results to be rendered
    const queryEngine: IQuery = await this.queryFactory.getQuery(this.codeblockConfiguration, this.context.sourcePath, this.context.frontmatter, this.renderId);
    const results = await queryEngine.applyQuery(this.renderId);

    // Render
    // Get the engine to render the results to HTML.
    const renderEngine: IRenderer = await this.renderFactory.getRenderer(this.codeblockConfiguration);

    const content = this.container.createEl('div');
    content.setAttr('data-query-id', this.renderId);

    if (queryEngine.error) {
      content.setText(`QATT query error: ${queryEngine.error}`);
    } else {
      // Render Engine Execution
      const renderResults = await renderEngine?.renderTemplate(this.codeblockConfiguration, results) ?? 'Unknown error or exception has occurred.';
      this.logger.debug('Render Results', renderResults);

      // Post Render handling as the output has to be HTML at the end so if the template return markdown then we need to convert it.
      // currently:
      // markdown - Obsidian internal callback.
      // micromark - parsing use micromark and extensions.
      const postRenderFormat = this.codeblockConfiguration.postRenderFormat ?? this.service.postRenderFormat;
      this.logger.debug('postRenderFormat: ', postRenderFormat);

      if (postRenderFormat === 'markdown') {
        await MarkdownPreviewView.renderMarkdown(renderResults, content, '', this.plugin);
      } else if (postRenderFormat === 'micromark') {
        this.logger.debug('micromark Render Results', markdown2html(renderResults));
        content.innerHTML = markdown2html(renderResults);
      } else {
        content.innerHTML = renderResults;
      }
    }

    // Replace the content of the container with the new content.
    this.container.firstChild?.replaceWith(content);

    // If we are debugging add the render ID to the top of the div to make
    // tracing simpler.
    if (this.codeblockConfiguration.logLevel === 'debug') {
      const debugWrapper = this.container.createEl('sub');
      debugWrapper.className = 'qatt-render-debugWrapper';
      debugWrapper.innerHTML = `RenderID: ${this.renderId}`;
      content.prepend(debugWrapper);
    }

    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    this.logger.groupEndId();
  };
}

