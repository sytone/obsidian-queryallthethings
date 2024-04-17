
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type MarkdownPostProcessorContext, MarkdownRenderChild, Plugin, TFile} from 'obsidian';
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
import {type QueryRendererV2Service} from 'QueryRendererV2';
import {NotesCacheService} from 'NotesCacheService';

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
    this.notesCacheService = service.use(NotesCacheService);
  }

  async onload() {
    this.renderId = `${this.codeblockConfiguration.id ?? ''}:${this.context.sourcePath}`;
    const file = this.plugin.app.vault.getAbstractFileByPath(this.context.sourcePath);
    if (!(file instanceof TFile)) {
      return;
    }

    this.file = file;

    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    this.logger.infoWithId(this.renderId, `Query Render generated for class ${this.container.className} -> ${this.codeblockConfiguration.queryDataSource ?? ''}`);

    this.registerEvent(this.plugin.app.workspace.on('qatt:notes-store-update', this.render));

    if (this.codeblockConfiguration.queryDataSource === 'dataview') {
      this.registerEvent(this.plugin.app.workspace.on('qatt:dataview-store-update', this.render));
    }

    this.registerEvent(this.plugin.app.workspace.on('qatt:all-notes-loaded', this.render));

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

    if (!this.notesCacheService.allNotesLoaded) {
      const content = this.container.createEl('div');
      content.setAttr('data-query-id', this.renderId);
      content.setText('Waiting for all notes to load...');
      return;
    }

    try {
      // If there is a target replacement file then we need to ignore it for the cache update
      // otherwise it will trigger a refresh and we will end up in an infinite loop.
      if (this.codeblockConfiguration.replaceTargetPath) {
        await this.service.notesCacheService.ignoreFileEventsForPeriod(this.codeblockConfiguration.replaceTargetPath, 1000);
      }

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
      let frontMatter = this.context.frontmatter;
      if (this.file instanceof TFile) {
        frontMatter = this.plugin.app.metadataCache.getFileCache(this.file)?.frontmatter;
      }

      const queryEngine: IQuery = await this.queryFactory.getQuery(this.codeblockConfiguration, this.context.sourcePath, frontMatter, this.renderId);
      const results = await queryEngine.applyQuery(this.renderId);

      if (queryEngine.error) {
        content.setText(`QATT query error: ${queryEngine.error}`);
        const endTime = new Date(Date.now());
        this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
        this.logger.groupEndId();
        return;
      }

      // --------------------------------------------------
      // Render
      // --------------------------------------------------
      // Get the engine to render the results using the specified render engine.
      const renderEngine: IRenderer = await this.renderFactory.getRenderer(this.codeblockConfiguration);
      // Render Engine Execution
      const renderResults = await renderEngine?.renderTemplate(this.codeblockConfiguration, results) ?? 'Unknown error or exception has occurred.';
      this.logger.debug('Render Results:', renderResults);

      // --------------------------------------------------
      // Post Rendering
      // --------------------------------------------------
      // Post Render handling as the output has to be HTML at the end if you want obsidian to
      // render it. You can force raw which is handy for update the files contents.
      // currently:
      // markdown - Obsidian internal callback.
      // micromark - parsing use micromark and extensions.
      // raw - return the raw output from the template with no changes from original render.
      const postRenderFormat = this.codeblockConfiguration.postRenderFormat ?? this.service.postRenderFormat;
      this.logger.debug('postRenderFormat: ', postRenderFormat);

      // Content will be inserted into a SPAN element.
      const renderedContentElement = document.createElement('span');
      const {renderedContent, rawPostRenderResult} = await this.getPostRenderFormat(postRenderFormat, renderResults, renderedContentElement, this.context.sourcePath);
      this.logger.debug('postRenderResults:', renderedContent.outerHTML);
      this.logger.debug('rawPostRenderResult:', rawPostRenderResult);

      // Determine if we are rendering on this page or to a separate page.
      const replaceCodeBlock = this.codeblockConfiguration.replaceCodeBlock ?? false;
      this.logger.debug('replaceCodeBlock:', replaceCodeBlock);
      const replaceType = this.codeblockConfiguration.replaceType ?? 'never';
      this.logger.debug('replaceType:', replaceType);
      this.logger.debug('replaceTargetPath:', this.codeblockConfiguration.replaceTargetPath);

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
      if (replaceType !== 'never' && this.codeblockConfiguration.replaceTargetPath) {
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
      if (replaceType !== 'never' && replaceCodeBlock) {
        this.logger.info('codeblock replacement');

        await this.plugin.app.vault.process(this.file, text => {
          const info = this.context.getSectionInfo(this.container);
          this.logger.info('info:', info);

          if (info) {
            this.logger.info('info:', info);
            // OLD
            const {lineStart} = info;
            const lineEnd = this.getCodeBlockEndLine(text, lineStart);
            if (lineEnd === -1 || !lineEnd) {
              return text;
            }

            const lineLength = lineEnd - lineStart;
            const lines = text.split('\n');
            lines.splice(lineStart, lineLength + 1, `${rawPostRenderResult}`);
            return lines.join('\n');
          }

          return `${text}`;
        });

        return;
      }

      // Update the element with the rendered content.
      const docFrag = document.createDocumentFragment();

      for (const childNode of Array.from(renderedContent.children)) {
        docFrag.append(childNode); // Note that this does NOT go to the DOM
      }

      content.append(docFrag);

      // Replace the content of the container with the new content.
      // this.container.firstChild?.replaceWith(content);
    } catch (error) {
      this.logger.error('Render Failure', error);
    }

    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    this.logger.groupEndId();
  };

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
    targetPath = targetPath.replace(/\\/g, '/');
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
        postRenderer = new ObsidianPostRenderer();
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
