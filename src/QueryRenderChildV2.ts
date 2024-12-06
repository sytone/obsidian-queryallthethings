/* eslint-disable complexity */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type MarkdownPostProcessorContext, MarkdownRenderChild, Plugin, TFile, normalizePath} from 'obsidian';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type IRenderer} from 'Render/IRenderer';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryFactory} from 'Query/QueryFactory';
import {type IQuery} from 'Query/IQuery';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {MicromarkPostRenderer} from 'PostRender/MicromarkPostRenderer';
import {ObsidianPostRenderer} from 'PostRender/ObsidianPostRenderer';
import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {HtmlPostRenderer} from 'PostRender/HtmlPostRenderer';
import {RawPostRenderer} from 'PostRender/RawPostRenderer';
import {type QueryRendererV2Service} from 'QueryRendererV2Service';
import {NotesCacheService} from 'NotesCacheService';
import {RenderTrackerService} from 'lib/RenderTrackerService';
import {DateTime} from 'luxon';
import {CsvLoaderService} from 'Data/CsvLoaderService';
import {MarkdownTableLoaderService} from 'Data/MarkdownTableLoaderService';
import {JsonLoaderService} from 'Data/JsonLoaderService';
import {SqlLoaderService} from 'Data/SqlLoaderService';
import pDebounce from 'p-debounce';

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
  file: TFile;
  notesCacheService: NotesCacheService;
  renderTrackerService: RenderTrackerService;

  csvLoaderService: CsvLoaderService | undefined;
  markdownTableLoaderService: MarkdownTableLoaderService | undefined;
  jsonLoaderService: JsonLoaderService | undefined;
  sqlLoaderService: SqlLoaderService | undefined;

  throttledRender: () => Promise<void>;
  debouncedRender: () => Promise<void>; // IDebouncedFunction<any[], () => Promise<void>>;

  private renderId: string;
  private startTime = new Date(Date.now());
  private queryResults: any;
  private renderResults: string;
  private readonly debounceWindow: number;
  private readonly disableDebounce: boolean;

  // eslint-disable-next-line max-params
  public constructor(
    container: HTMLElement,
    codeblockConfiguration: QattCodeBlock,
    context: MarkdownPostProcessorContext,
    service: QueryRendererV2Service,
    debounceWindow = 5000,
    disableDebounce = false) {
    super(container);
    this.container = container;
    this.codeblockConfiguration = codeblockConfiguration;
    this.context = context;
    this.service = service;

    this.debounceWindow = debounceWindow;
    this.disableDebounce = disableDebounce;

    // If I use 'use' at the top of this class then it throws
    // an error that there is no context available. This class
    // cannot extend Service.
    this.plugin = service.use(Plugin);
    this.logger = service.use(LoggingService).getLogger('Qatt.QueryRenderChildV2');
    this.queryFactory = service.use(QueryFactory);
    this.renderFactory = service.use(RenderFactory);
    this.notesCacheService = service.use(NotesCacheService);
    this.renderTrackerService = service.use(RenderTrackerService);
    this.csvLoaderService = service.use(CsvLoaderService);
    this.markdownTableLoaderService = service.use(MarkdownTableLoaderService);
    this.jsonLoaderService = service.use(JsonLoaderService);
    this.sqlLoaderService = service.use(SqlLoaderService);
  }

  async onload() {
    this.renderId = `${this.codeblockConfiguration.id ?? ''}:${this.context.sourcePath}`;

    // Ensure we have a TFile instance for the query/rendering process.
    const file = this.plugin.app.vault.getAbstractFileByPath(this.context.sourcePath);
    if (!(file instanceof TFile)) {
      return;
    }

    this.file = file;

    // Set the logging to be overridden if the user set the logLevel in the YAML configuration.
    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    this.logger.debugWithId(this.renderId, `Query Render generated for class ${this.container.className} -> ${this.codeblockConfiguration.queryDataSource ?? ''}`);

    // Setup callbacks for when the notes store is updated. We should render again.
    this.registerEvent(this.plugin.app.workspace.on('qatt:notes-store-update', async () => {
      this.logger.infoWithId(this.renderId, 'qatt:notes-store-update event triggered');
      await (this.disableDebounce ? this.render() : this.debouncedRender());
    }));

    // Render all the codeblock when the initial load of notes is completed.
    this.registerEvent(this.plugin.app.workspace.on('qatt:all-notes-loaded', async () => {
      await (this.disableDebounce ? this.render() : this.debouncedRender());
    }));

    // Refresh the codeblocks when the refresh event is triggered. This is user or from other stores like
    // CSV, JSON, etc.
    this.registerEvent(this.plugin.app.workspace.on('qatt:refresh-codeblocks', async () => {
      await (this.disableDebounce ? this.render() : this.debouncedRender());
    }));

    if (this.codeblockConfiguration.queryDataSource === 'dataview') {
      this.registerEvent(this.plugin.app.workspace.on('qatt:dataview-store-update', async () => {
        await (this.disableDebounce ? this.render() : this.debouncedRender());
      }));
    }

    // Run once and then wait for the debounce window to pass before running again. This will
    // mean the UI will not update while the user is typing or making changes. The value
    // can be set in the settings UI and defaults to 5000 milliseconds.
    this.debouncedRender = pDebounce(this.render, this.debounceWindow); // Old debounce(this.render, this.debounceWindow, {isImmediate: true});

    // On first load do not wait for the debounce window.
    await this.render();
  }

  onunload() {
    // Unload resources
    // this.debouncedRender.cancel();
    this.logger.infoWithId(this.renderId, `QueryRenderChild unloaded for ${this.renderId}`);
  }

  /**
   * Renders the query and displays the results.
   */
  render = async () => {
    this.logger.groupId(this.renderId);
    this.startTime = new Date(Date.now());
    this.logger.debugWithId(this.renderId, 'Render Start');

    this.container.innerHTML = '';

    // If the cache has not been loaded then just put a placeholder message, when
    // the all loaded event is triggered we will render the content.
    if (!this.notesCacheService.allNotesLoaded
      || !this.csvLoaderService?.initialImportCompleted
      || !this.markdownTableLoaderService?.initialImportCompleted
      || !this.jsonLoaderService?.initialImportCompleted
      || !this.sqlLoaderService?.initialImportCompleted) {
      this.logger.debugWithId(this.renderId, 'Waiting for all notes to load');
      const content = this.container.createEl('div');
      content.setAttr('data-query-id', this.renderId);
      content.className = 'qatt-loader';
      return;
    }

    // Setup all the default values based on YAML configuration.
    const postRenderFormat = this.codeblockConfiguration.postRenderFormat ?? this.service.postRenderFormat;
    const replaceCodeBlock = this.codeblockConfiguration.replaceCodeBlock ?? false;
    const replaceType = this.codeblockConfiguration.replaceType ?? 'never';

    // Setup the base div that all the content will be shown in.
    const content = this.container.createEl('div');
    content.setAttr('data-query-id', this.renderId);

    // If we are debugging add the render ID to the top of the div to make
    // tracing simpler.
    if (this.codeblockConfiguration.logLevel === 'debug') {
      const debugWrapper = this.container.createEl('sub');
      debugWrapper.className = 'qatt-render-debugWrapper';
      debugWrapper.innerHTML = `RenderID: ${this.renderId}<br />`;
      content.prepend(debugWrapper);
    }

    // --------------------------------------------------
    // Query
    // --------------------------------------------------
    // Run query and get results to be rendered
    try {
      // Pull the frontmatter from the cache as the one passed in may not
      // actually have any content. No idea why and do not have time to
      // debug, assuming it is some race condition.
      let frontMatter = this.context.frontmatter;
      if (this.file instanceof TFile) {
        frontMatter = this.plugin.app.metadataCache.getFileCache(this.file)?.frontmatter;
      }

      // Get the query engine to run the query. Based on codeblock or default which is alasql.
      const queryEngine: IQuery = await this.queryFactory.getQuery(this.codeblockConfiguration, this.context.sourcePath, frontMatter, this.renderId);
      this.queryResults = await queryEngine.applyQuery(this.renderId);

      // For a error state, return the query engine error to the user in the codeblock replacement.
      if (queryEngine.error) {
        content.setText(`QATT query error: ${queryEngine.error}`);
        this.logQueryRenderCompletion();
        return;
      }
    } catch (error) {
      this.logger.error('Unknown Query Failure', error);
      this.logQueryRenderCompletion();
      return;
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    // Get the engine to render the results using the specified render engine.
    const renderEngine: IRenderer = await this.renderFactory.getRenderer(this.codeblockConfiguration);
    try {
      // Render Engine Execution
      this.renderResults = await renderEngine?.renderTemplate(this.codeblockConfiguration, this.queryResults) ?? 'Unknown error or exception has occurred.';
      this.logger.debugWithId(this.renderId, 'Render Results:', this.renderResults);
    } catch (error) {
      content.setText(`QATT render error: ${JSON.stringify(error)}`);
      this.logQueryRenderCompletion();
      return;
    }

    try {
      // --------------------------------------------------
      // Post Rendering
      // --------------------------------------------------
      // Post Render handling as the output has to be HTML at the end if you want obsidian to
      // render it. You can force raw which is handy for update the files contents.
      // currently:
      // markdown - Obsidian internal callback.
      // micromark - parsing use micromark and extensions.
      // raw - return the raw output from the template with no changes from original render.
      this.logger.debugWithId(this.renderId, 'postRenderFormat: ', postRenderFormat);

      // Content will be inserted into a SPAN element.
      const renderedContentElement = document.createElement('span');
      const {renderedContent, rawPostRenderResult} = await this.getPostRenderFormat(postRenderFormat, this.renderResults, renderedContentElement, this.context.sourcePath);
      this.logger.debugWithId(this.renderId, 'postRenderResults:', renderedContent);
      this.logger.debugWithId(this.renderId, 'rawPostRenderResult:', rawPostRenderResult);

      // Determine if we are rendering on this page or to a separate page.
      this.logger.debugWithId(this.renderId, 'replaceCodeBlock:', replaceCodeBlock);
      this.logger.debugWithId(this.renderId, 'replaceType:', replaceType);
      this.logger.debugWithId(this.renderId, 'replaceTargetPath:', this.codeblockConfiguration.replaceTargetPath);

      // Pull out this code block.
      // This is TBD work and not production ready.
      // const sectionInfo = this.context.getSectionInfo(this.container);
      // const noteWithCodeblock = this.getTargetFile(this.context.sourcePath);
      // const noteWithCodeblockContent = noteWithCodeblock ? await this.getCachedContent(noteWithCodeblock) : '';
      // if (sectionInfo?.lineStart && sectionInfo?.lineEnd) {
      //   const cleanedNote = noteWithCodeblockContent.split('\n').splice(sectionInfo.lineStart, sectionInfo.lineEnd - sectionInfo.lineStart);
      //   this.logger.debug('cleanedNote:', cleanedNote);
      // }

      // If we have a target path we need to update a external file with the results.
      // If there is a target replacement file then we need to ignore it for the cache update
      // otherwise it will trigger a refresh and we will end up in an infinite loop.
      this.logger.debugWithId(this.renderId, 'Checking for output file update', replaceCodeBlock);

      if (replaceType !== 'never' && this.codeblockConfiguration.replaceTargetPath) {
        this.logger.debugWithId(this.renderId, 'rendering to output file:', this.codeblockConfiguration.replaceTargetPath);

        await this.service.notesCacheService.ignoreFileEventsForPeriod(this.codeblockConfiguration.replaceTargetPath, 1000);
        await this.writeRenderedOutputToFile(this.codeblockConfiguration.replaceTargetPath, rawPostRenderResult, replaceType);
        return;
      }

      // Do the replacement in the open file.
      /* Example of how to replace the code block in the open file.
      ```qatt
      logLevel: debug
      replaceCodeBlock: false
      replaceType: once
      query: |
        SELECT TOP 2 FROM events
      template: |
        {{stringify result}}
      ```
      */

      this.logger.debugWithId(this.renderId, 'Checking for inline codeblock replacement', replaceCodeBlock);

      if (replaceType !== 'never' && replaceCodeBlock) {
        this.logger.infoWithId(this.renderId, 'codeblock replacement');

        if (this.codeblockConfiguration.id === undefined) {
          this.logger.errorWithId(this.renderId, 'codeblock id is undefined');
          return;
        }

        if ((replaceType === 'onceDaily' || replaceType === 'onceDailyAppend' || replaceType === 'onceDailyPrepend') && await this.renderTrackerService.updatedToday(this.context.sourcePath, this.codeblockConfiguration.id)) {
          return;
        }

        // Exclude this file from update notifications to stop multiple loops.
        await this.service.notesCacheService.ignoreFileEventsForPeriod(this.context.sourcePath, 1000);

        await this.renderTrackerService.setReplacementTime(this.context.sourcePath, this.codeblockConfiguration.id, DateTime.now());
        await this.plugin.app.vault.process(this.file, text => {
          const info = this.context.getSectionInfo(this.container);

          if (info) {
            // OLD
            const {lineStart} = info;
            const lineEnd = this.getCodeBlockEndLine(text, lineStart);
            if (lineEnd === -1 || !lineEnd) {
              return text;
            }

            const lineLength = lineEnd - lineStart;
            const lines = text.split('\n');
            if (replaceType === 'onceDailyAppend' || replaceType === 'onceWeeklyAppend' || replaceType === 'alwaysAppend') {
              // Append
              const codeblockId = this.codeblockConfiguration.id ?? '';
              lines.splice(lineEnd + 1, 0, `%%${codeblockId}%%\n${rawPostRenderResult}\n%%${codeblockId}%%`);
              return lines.join('\n');
            }

            // Replacement
            lines.splice(lineStart, lineLength + 1, `${rawPostRenderResult}`);
            return lines.join('\n');
          }

          return `${text}`;
        });

        return;
      }

      this.logger.debugWithId(this.renderId, 'update fragment');

      // Update the element with the rendered content.
      const docFrag = document.createDocumentFragment();

      for (const childNode of Array.from(renderedContent.children)) {
        docFrag.append(childNode); // Note that this does NOT go to the DOM
      }

      content.append(docFrag);

      // Replace the content of the container with the new content.
      // this.container.firstChild?.replaceWith(content);
    } catch (error) {
      this.logger.error('Unknown Render Failure', error);
      this.logQueryRenderCompletion();
      return;
    }

    this.logQueryRenderCompletion();
  };

  private logQueryRenderCompletion() {
    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render ended and took ${endTime.getTime() - this.startTime.getTime()}ms`);
    this.logger.groupEndId();
  }

  private getCodeBlockEndLine(text: string, startLine: number, count = 1) {
    let line = startLine + 1;
    const lines = text.split('\n');
    while (line < lines.length) {
      if (count > 500) {
        return -1;
      }

      if (lines[line].startsWith('```') && lines[line].length === 3) {
        return line;
      }

      line++;
      count++;
    }

    return line;
  }

  /**
   * Writes the rendered output to a file.
   * If the file already exists and the replacement command is once only, then the file will not be modified.
   * @param targetPath - The path of the target file.
   * @param postRenderResults - The rendered output to be written to the file.
   * @param replaceCodeBlock - Determines whether to append or prepend the rendered output to the existing file content.
   */
  private async writeRenderedOutputToFile(targetPath: string, postRenderResults: string, replaceCodeBlock: string) {
    this.logger.infoWithId(this.renderId, `writeRenderedOutputToFile: ${targetPath}`);

    const targetFile = this.getTargetFile(targetPath);
    let content = '';
    let lastModified = window.moment();

    if (targetFile && replaceCodeBlock === 'once') {
      this.logger.debugWithId(this.renderId, `The file '${targetPath}' already exists and replacement is once only.`);
      return;
    }

    if (targetFile) {
      content = await this.getCachedContent(targetFile);
      lastModified = window.moment(targetFile.stat.mtime);
    }

    // If lastModified date is greater than 24 hours and replaceCodeBlock is set to onceDaily then proceed.
    if (lastModified.isAfter(window.moment().subtract(1, 'day')) && replaceCodeBlock === 'onceDaily') {
      this.logger.debugWithId(this.renderId, `The file '${targetPath}' was updated less than a day ago and replacement is onceDaily only.`);
      return;
    }

    // If lastModified date is greater than 1 week and replaceCodeBlock is set to onceWeekly then proceed.
    if (lastModified.isAfter(window.moment().subtract(1, 'week')) && replaceCodeBlock === 'onceWeekly') {
      this.logger.debugWithId(this.renderId, `The file '${targetPath}' was updated less than a week ago and replacement is onceWeekly only.`);
      return;
    }

    let updatedContent = '';
    if (replaceCodeBlock.toLowerCase().includes('append')) {
      updatedContent = content + postRenderResults;
    } else if (replaceCodeBlock.toLowerCase().includes('prepend')) {
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

    return this.plugin.app.vault.process(targetFile, () => postRenderResults);
    // Original return, updated to follow obsidian API guidance.
    // return this.plugin.app.vault.modify(targetFile, postRenderResults);
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
    targetPath = normalizePath(targetPath);
    return this.plugin.app.vault.getFileByPath(targetPath) ?? undefined;
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
        postRenderer = new ObsidianPostRenderer(this.plugin.app);
        break;
      }

      case 'micromark': {
        postRenderer = new MicromarkPostRenderer();
        break;
      }

      case 'html': {
        postRenderer = new HtmlPostRenderer();
        break;
      }

      case 'raw': {
        postRenderer = new RawPostRenderer();
        break;
      }

      default: {
        postRenderer = new RawPostRenderer();
        break;
      }
    }

    const rawPostRenderResult = await postRenderer.renderMarkdown(renderResults, renderedContent, sourcePath, this.plugin);
    return {renderedContent, rawPostRenderResult};
  }
}
