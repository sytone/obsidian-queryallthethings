
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type MarkdownPostProcessorContext, normalizePath, Plugin, TFile} from 'obsidian';
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

/**
 * All the rendering logic is handled here. It uses ths configuration to
 * determine the rendering engine and the query engine.
 *
 * @export
 * @class QueryRenderChildV3
 * @extends {MarkdownRenderChild}
 */
export class QueryRenderChildV3 {
  plugin: Plugin;
  logger: Logger;
  queryFactory: QueryFactory;
  renderFactory: RenderFactory;
  rendering = false;
  file: TFile;

  private renderId: string;

  public constructor(
    public container: HTMLElement,
    public codeblockConfiguration: QattCodeBlock,
    public context: MarkdownPostProcessorContext,
    public service: QueryRendererV2Service) {
    // If I use 'use' at the top of this class then it throws
    // an error that there is no context available. This class
    // cannot extend Service.
    this.plugin = service.use(Plugin);
    this.logger = service.use(LoggingService).getLogger('Qatt.QueryRenderChildV2');
    this.queryFactory = service.use(QueryFactory);
    this.renderFactory = service.use(RenderFactory);
  }

  public async create(source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) {
    element.empty();
    this.logger.infoWithId('Source:', source);

    this.renderId = `${this.codeblockConfiguration.id ?? 'unknown'}:${ctx.sourcePath}`;

    const file = this.plugin.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile)) {
      return;
    }

    this.file = file;

    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    const className = element.className ?? 'unknown';
    const queryDataSource = this.codeblockConfiguration.queryDataSource ?? 'unknown';
    this.logger.infoWithId(this.renderId, `Query Render generated for class ${className} -> ${queryDataSource}`);

    this.logger.groupId(this.renderId);
    const startTime = new Date(Date.now());
    // Element.innerHTML = '';

    try {
      // If there is a target replacement file then we need to ignore it for the cache update
      // otherwise it will trigger a refresh and we will end up in an infinite loop.
      if (this.codeblockConfiguration.replaceTargetPath) {
        await this.service.notesCacheService.ignoreFileEventsForPeriod(this.codeblockConfiguration.replaceTargetPath, 1000);
      }

      // Setup the base div that all the content will be shown in.
      const content = element.createEl('div');
      content.setAttr('data-query-id', this.renderId);

      // If we are debugging add the render ID to the top of the div to make
      // tracing simpler.
      if (this.codeblockConfiguration.logLevel === 'debug') {
        const debugWrapper = element.createEl('sub');
        debugWrapper.className = 'qatt-render-debugWrapper';
        debugWrapper.innerHTML = `RenderID: ${this.renderId}<br />`;
        content.prepend(debugWrapper);
      }

      // --------------------------------------------------
      // Query
      // --------------------------------------------------
      // Run query and get results to be rendered
      const queryEngine: IQuery = await this.queryFactory.getQuery(this.codeblockConfiguration, ctx.sourcePath, ctx.frontmatter, this.renderId);
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
      const {renderedContent, rawPostRenderResult} = await this.getPostRenderFormat(postRenderFormat, renderResults, renderedContentElement, ctx.sourcePath);
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
          const info = ctx.getSectionInfo(element);
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
