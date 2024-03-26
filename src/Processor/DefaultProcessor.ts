/* eslint-disable max-params */
import {type Plugin} from 'obsidian';
import {type QattCodeBlock} from 'QattCodeBlock';
import {type Logger} from 'lib/LoggingService';
import {type IQuery} from 'Query/IQuery';
import {type IRenderer} from 'Render/IRenderer';
import {type IPostRenderer} from 'PostRender/IPostRenderer';

export class DefaultProcessor {
  private readonly renderId: string;

  public constructor(
    public plugin: Plugin,
    public codeblockConfiguration: QattCodeBlock,
    public logger: Logger,
    public element: HTMLElement,
    public sourcePath: string,
    public queryEngine: IQuery,
    public renderEngine: IRenderer,
    public postRenderEngine: IPostRenderer) {
    this.renderId = `${this.codeblockConfiguration.id}:${this.sourcePath}`;

    if (this.codeblockConfiguration.logLevel) {
      this.logger.setLogLevel(this.codeblockConfiguration.logLevel);
    }

    this.logger.infoWithId(this.renderId, `Processor generated for for data source ${this.codeblockConfiguration.queryDataSource}`);
  }

  /**
   * Renders the query and returns the results.
   */
  render = async () => {
    this.logger.groupId(this.renderId);
    const startTime = new Date(Date.now());
    let finalResults = '';
    const postRenderElement = document.createElement('span');
    let postRenderString = '';

    try {
      // --------------------------------------------------
      // Query
      // --------------------------------------------------
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const results = await this.queryEngine.applyQuery(this.renderId);

      if (this.queryEngine.error) {
        finalResults = `QATT query error: ${this.queryEngine.error}`;
        const endTime = new Date(Date.now());
        this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
        this.logger.groupEndId();
        return;
      }

      // --------------------------------------------------
      // Render
      // --------------------------------------------------
      const renderResults = await this.renderEngine?.renderTemplate(this.codeblockConfiguration, results) ?? 'Unknown error or exception has occurred.';
      this.logger.debug('Render Results:', renderResults);

      // --------------------------------------------------
      // Post Rendering
      // --------------------------------------------------
      postRenderString = await this.postRenderEngine.renderMarkdown(renderResults, postRenderElement, this.sourcePath, this.plugin) ?? 'Unknown error or exception has occurred.';

      this.logger.debug('postRenderElement.outerHTML:', postRenderElement.outerHTML);
      this.logger.debug('postRenderString:', postRenderString);
    } catch (error) {
      this.logger.error('Render Failure', error);
    }

    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - startTime.getTime()}ms`);
    this.logger.groupEndId();

    return {postRenderElement, postRenderString};
  };
}
