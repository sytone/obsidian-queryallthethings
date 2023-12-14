
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type MarkdownPostProcessorContext, MarkdownPreviewView, MarkdownRenderChild, Plugin, debounce, type TFile} from 'obsidian';
import {QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';
import {Service, useSettings} from '@ophidian/core';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {DateTime} from 'luxon';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {MicromarkPostRenderer, markdown2html} from 'PostRender/MicromarkRenderer';
import {NotesCacheService} from 'NotesCacheService';
import {ObsidianRenderer} from 'PostRender/ObsidianRenderer';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {HtmlRenderer} from 'PostRender/HtmlRenderer';
import {RawRenderer} from 'PostRender/RawRenderer';

export interface IRenderingSettings {
  postRenderFormat: string;
  enableExperimentalRender: boolean;
  renderingSettingsOpen: boolean;

}

export const RenderingSettingsDefaults: IRenderingSettings = {
  postRenderFormat: 'micromark',
  enableExperimentalRender: false,
  renderingSettingsOpen: false,
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
  notesCacheService = this.use(NotesCacheService);
  renderingSettingsOpen: boolean;

  lastCreation: DateTime;
  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    RenderingSettingsDefaults,
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Updated Settings');
      this.postRenderFormat = settings.postRenderFormat;
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
    },
    (settings: IRenderingSettings) => {
      this.logger.info('QueryRendererV2Service Initialize Settings');
      this.postRenderFormat = settings.postRenderFormat;
      this.renderingSettingsOpen = settings.renderingSettingsOpen;
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

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.renderingSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({open: this.renderingSettingsOpen, text: 'Rendering Settings', level: 'h2', class: 'settings-heading'}), onToggle);

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
  rendering = false;

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

  async onload() {
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
    this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', this.render));

    await this.render();
  }

  onunload() {
    // Unload resources
    this.logger.infoWithId(this.renderId, `QueryRenderChild unloaded for ${this.renderId}`);
  }

  /**
   * Renders the query and displays the results.
   */
  render = async () => {
    this.logger.groupId(this.renderId);
    const startTime = new Date(Date.now());
    this.container.innerHTML = '';

    try {
      // If there is a target replacement file then we need to ignore it for the cache update
      // otherwise it will trigger a refresh and we will end up in an infinite loop.
      if (this.codeblockConfiguration.replaceTargetPath) {
        await this.service.notesCacheService.ignoreFileEventsForPeriod(this.codeblockConfiguration.replaceTargetPath, 1000);
      }

      // Query
      // Run query and get results to be rendered
      const queryEngine: IQuery = await this.queryFactory.getQuery(this.codeblockConfiguration, this.context.sourcePath, this.context.frontmatter, this.renderId);
      const results = await queryEngine.applyQuery(this.renderId);

      // Render
      // Get the engine to render the results using the specified render engine.
      const renderEngine: IRenderer = await this.renderFactory.getRenderer(this.codeblockConfiguration);

      const content = this.container.createEl('div');
      content.setAttr('data-query-id', this.renderId);

      if (queryEngine.error) {
        content.setText(`QATT query error: ${queryEngine.error}`);
      } else {
        // Render Engine Execution
        const renderResults = await renderEngine?.renderTemplate(this.codeblockConfiguration, results) ?? 'Unknown error or exception has occurred.';
        this.logger.debug('Render Results', renderResults);

        // Post Rendering
        // Post Render handling as the output has to be HTML at the end if you want obsidian to
        // render it. You can force raw which is handy for update the files contents.
        // currently:
        // markdown - Obsidian internal callback.
        // micromark - parsing use micromark and extensions.
        // raw - return the raw output from the template with no changes from original render.
        const postRenderFormat = this.codeblockConfiguration.postRenderFormat ?? this.service.postRenderFormat;
        this.logger.debug('postRenderFormat: ', postRenderFormat);
        const renderedContent = document.createElement('span');
        const postRenderResults = await this.getPostRenderFormat(postRenderFormat, renderResults, renderedContent, this.context.sourcePath);
        this.logger.debug('postRenderResults:', postRenderResults);

        // Determine if the code block should be replaced with the rendered content or output to a
        // separate file.
        const replaceCodeBlock = this.codeblockConfiguration.replaceCodeBlock ?? 'never';
        this.logger.debug('replaceCodeBlock:', replaceCodeBlock);
        this.logger.debug('replaceTargetPath:', this.codeblockConfiguration.replaceTargetPath);

        const sectionInfo = this.context.getSectionInfo(this.container);
        const noteWithCodeblock = this.getTargetFile(this.context.sourcePath);
        const noteWithCodeblockContent = noteWithCodeblock ? await this.getCachedContent(noteWithCodeblock) : '';
        if (sectionInfo?.lineStart && sectionInfo?.lineEnd) {
          const cleanedNote = noteWithCodeblockContent.split('\n').splice(sectionInfo.lineStart, sectionInfo.lineEnd - sectionInfo.lineStart);
          this.logger.debug('cleanedNote:', cleanedNote);
        }

        switch (replaceCodeBlock) {
          // If once it needs to find and replace the code block on the page.
          // If always it needs to find and append the rendered output to the page by default.
          case 'once': {
            if (this.codeblockConfiguration.replaceTargetPath) {
            // Search for codeblock in original markdown file.

              await this.writeRenderedOutputToFile(this.codeblockConfiguration.replaceTargetPath, postRenderResults.innerHTML, 'replace');
            }

            break;
          }

          case 'always': {
            if (this.codeblockConfiguration.replaceTargetPath) {
              await this.writeRenderedOutputToFile(this.codeblockConfiguration.replaceTargetPath, postRenderResults.innerHTML, 'replace');
            }

            break;
          }

          case 'alwaysappend': {
            if (this.codeblockConfiguration.replaceTargetPath) {
              await this.writeRenderedOutputToFile(this.codeblockConfiguration.replaceTargetPath, postRenderResults.innerHTML, 'append');
            }

            break;
          }

          case 'alwaysprepend': {
            if (this.codeblockConfiguration.replaceTargetPath) {
              await this.writeRenderedOutputToFile(this.codeblockConfiguration.replaceTargetPath, postRenderResults.innerHTML, 'prepend');
            }

            break;
          }
        // No default
        }

        const docFrag = document.createDocumentFragment();

        for (const childNode of Array.from(postRenderResults.children)) {
          docFrag.append(childNode); // Note that this does NOT go to the DOM
        }

        content.append(docFrag);
      }

      // Replace the content of the container with the new content.
      // this.container.firstChild?.replaceWith(content);

      // If we are debugging add the render ID to the top of the div to make
      // tracing simpler.
      if (this.codeblockConfiguration.logLevel === 'debug') {
        const debugWrapper = this.container.createEl('sub');
        debugWrapper.className = 'qatt-render-debugWrapper';
        debugWrapper.innerHTML = `RenderID: ${this.renderId}<br />`;
        content.prepend(debugWrapper);
      }
    } catch (error) {
      this.logger.error('Render Failure', error);
    }

    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    this.logger.groupEndId();
  };

  /**
   * Writes the rendered output to a file.
   * @param targetPath - The path of the target file.
   * @param postRenderResults - The rendered output to be written to the file.
   * @param replaceCodeBlock - Determines whether to append or prepend the rendered output to the existing file content.
   */
  private async writeRenderedOutputToFile(targetPath: string, postRenderResults: string, replaceCodeBlock: string) {
    this.logger.infoWithId(this.renderId, `writeRenderedOutputToFile: ${targetPath}`);

    const targetFile = this.getTargetFile(targetPath);
    let content = '';

    if (targetFile) {
      content = await this.getCachedContent(targetFile);
    }

    let updatedContent = '';
    if (replaceCodeBlock === 'append') {
      updatedContent = content + postRenderResults;
    } else if (replaceCodeBlock === 'prepend') {
      updatedContent = postRenderResults + content;
    } else {
      updatedContent = postRenderResults;
    }

    await (targetFile ? this.modifyFile(targetFile, updatedContent) : this.createFile(targetPath, updatedContent));
  }

  /**
   * Creates a new file at the specified target path with the given post-render results.
   * @param targetPath - The path where the new file will be created.
   * @param postRenderResults - The post-render results to be written to the new file.
   * @returns A Promise that resolves with the newly created file.
   */
  private async createFile(targetPath: string, postRenderResults: string) {
    await this.service.notesCacheService.ignoreFileEventsForPeriod(targetPath, 1000);
    return this.plugin.app.vault.create(targetPath, postRenderResults);
  }

  /**
   * Modifies the contents of a file with the given post-render results.
   * @param targetFile - The file to modify.
   * @param postRenderResults - The post-render results to use for modification.
   * @returns A promise that resolves with the modified file contents.
   */
  private async modifyFile(targetFile: TFile, postRenderResults: string) {
    await this.service.notesCacheService.ignoreFileEventsForPeriod(targetFile.path, 1000);

    return this.plugin.app.vault.modify(targetFile, postRenderResults);
  }

  /**
   * Retrieves the cached content of a target file.
   * @param targetFile - The file to retrieve the cached content for.
   * @returns A promise that resolves with the cached content of the target file.
   */
  private async getCachedContent(targetFile: TFile): Promise<string> {
    return this.plugin.app.vault.cachedRead(targetFile);
  }

  /**
   * Returns the TFile object for the file located at the specified target path.
   * @param targetPath - The path of the target file.
   * @returns The TFile object for the file located at the specified target path, or undefined if the file is not found.
   */
  private getTargetFile(targetPath: string): TFile | undefined {
    return this.plugin.app.vault.getFiles().find(file => file.path === targetPath);
  }

  /**
   * Returns the rendered content based on the post-render format specified.
   * @param postRenderFormat - The format in which the content should be rendered.
   * @param renderResults - The content to be rendered.
   * @param renderedContent - The HTML element where the content will be rendered.
   * @returns The rendered content.
   */
  private async getPostRenderFormat(postRenderFormat: string, renderResults: string, renderedContent: HTMLSpanElement, sourcePath: string) {
    let postRenderer: IPostRenderer;
    switch (postRenderFormat) {
      case 'markdown': {
        postRenderer = new ObsidianRenderer();
        break;
      }

      case 'micromark': {
        postRenderer = new MicromarkPostRenderer();
        break;
      }

      case 'html': {
        postRenderer = new HtmlRenderer();
        break;
      }

      case 'raw': {
        postRenderer = new RawRenderer();
        break;
      }

      default: {
        postRenderer = new RawRenderer();
        break;
      }
    }

    await postRenderer.renderMarkdown(renderResults, renderedContent, sourcePath, this.plugin);
    return renderedContent;

    // Old Approach
    // const postRenderFunctions: Record<string, () => Promise<HTMLSpanElement>> = {
    //   markdown: async () => {
    //     await MarkdownPreviewView.renderMarkdown(renderResults, renderedContent, sourcePath, this.plugin);
    //     this.logger.debugWithId(this.renderId, 'renderedContent from MarkdownPreviewView.renderMarkdown', renderedContent);
    //     this.logger.debugWithId(this.renderId, 'renderedContent from MarkdownPreviewView.renderMarkdown', renderedContent.innerHTML);

    //     return renderedContent;
    //   },
    //   micromark: async () => {
    //     const micromarkHtml = markdown2html(renderResults);
    //     const parentSpan = document.createElement('span');
    //     parentSpan.innerHTML = micromarkHtml;
    //     return parentSpan;
    //   },
    //   raw: async () => {
    //     const parentSpan = document.createElement('span');
    //     parentSpan.innerHTML = renderResults;
    //     return parentSpan;
    //   },
    //   html: async () => {
    //     const parentSpan = document.createElement('span');
    //     parentSpan.innerHTML = renderResults;
    //     return parentSpan;
    //   },
    // };

    // const postRenderFunction = postRenderFunctions[postRenderFormat] || (async () => renderResults);

    // return postRenderFunction();
  }
}

