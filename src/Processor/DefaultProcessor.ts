/* eslint-disable max-params */
import {type QattCodeBlock} from 'QattCodeBlock';
import {type Logger} from 'lib/LoggingService';
import {type IQuery} from 'Query/IQuery';
import {type IRenderer} from 'Render/IRenderer';
import {type IPostRenderer} from 'PostRender/IPostRenderer';

export class DefaultProcessor {
  private readonly renderId: string;
  private startTime: Date;
  private finalResults: string;
  private hadError: boolean;

  public constructor(
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
    this.finalResults = '';
    this.startTime = new Date(Date.now());

    this.logger.groupId(this.renderId);

    const postRenderElement = document.createElement('span');
    let postRenderString = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const queryResults = await this.processQuery();
      if (this.hadError) {
        this.logger.error('Query Failure', this.finalResults);
        postRenderString = this.finalResults;
        this.logRenderEnd();
        return {postRenderElement, postRenderString};
      }

      const renderResults = await this.processRender(queryResults);
      postRenderString = await this.processPostRender(renderResults, postRenderElement);
    } catch (error) {
      this.logger.error('Render Failure', error);
    }

    this.logRenderEnd();
    return {postRenderElement, postRenderString};
  };

  private logRenderEnd() {
    const endTime = new Date(Date.now());
    this.logger.infoWithId(this.renderId, `Render End: ${endTime.getTime() - this.startTime.getTime()}ms`);
    this.logger.groupEndId();
  }

  /**
   * Process the query and return the results.
   *
   * @private
   * @return {*}
   * @memberof DefaultProcessor
   */
  private async processQuery(): Promise<any> {
    // --------------------------------------------------
    // Query
    // --------------------------------------------------
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const results = await this.queryEngine.applyQuery(this.renderId);

    if (this.queryEngine.error) {
      this.hadError = true;
      this.finalResults = `QATT query error: ${this.queryEngine.error}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results;
  }

  /**
   * Process the results from the query and render the output.
   *
   * @private
   * @param {*} queryResults
   * @return {*}
   * @memberof DefaultProcessor
   */
  private async processRender(queryResults: any): Promise<string> {
    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    const renderResults = await this.renderEngine?.renderTemplate(this.codeblockConfiguration, queryResults) ?? 'Unknown error or exception has occurred.';
    this.logger.debug('Render Results:', renderResults);

    return renderResults;
  }

  /**
   * Process the results from the query and render the output.
   *
   * @private
   * @param {*} queryResults
   * @return {*}
   * @memberof DefaultProcessor
   */
  private async processPostRender(renderResults: string, postRenderElement: HTMLSpanElement): Promise<string> {
    // --------------------------------------------------
    // Post Rendering
    // --------------------------------------------------
    const postRenderString = await this.postRenderEngine.renderMarkdown(renderResults, postRenderElement, this.sourcePath) ?? 'Unknown error or exception has occurred.';
    this.logger.debug('postRenderElement.outerHTML:', postRenderElement.outerHTML);
    this.logger.debug('postRenderString:', postRenderString);

    return postRenderString;
  }
}
