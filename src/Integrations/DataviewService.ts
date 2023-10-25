
import {Plugin} from 'obsidian';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {getAPI, isPluginEnabled, type PageMetadata} from 'obsidian-dataview';

/**
 * This service handles the integration with the Dataview plugin.
 *
 * @export
 * @class DataviewService
 * @extends {Service}
 */
export class DataviewService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.DataviewService');

  /**
   * Flag to indicate if the Dataview plugin is enabled.
   *
   * @memberof DataviewService
   */
  public dataViewEnabled = false;

  onload(): void {
    if (isPluginEnabled(this.plugin.app)) {
      this.dataViewEnabled = true;
    }
  }

  /**
   * Returns a map of all the Dataview pages.
   *
   * @return {*}  {Map<string, PageMetadata>}
   * @memberof DataviewService
   */
  public getDataviewPages(): Map<string, PageMetadata> {
    if (!this.dataViewEnabled) {
      return new Map<string, PageMetadata>();
    }

    const dataviewApi = getAPI(this.plugin.app);
    if (!dataviewApi) {
      return new Map<string, PageMetadata>();
    }

    return dataviewApi.index.pages;
  }

  /**
   * Returns an array of all the Dataview pages.
   *
   * @return {*}  {any[]}
   * @memberof DataviewService
   */
  public getDataviewPagesArray(): any[] {
    const dataViewApi = getAPI(this.plugin.app);
    if (dataViewApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return dataViewApi ? Array.from(dataViewApi.pages().values) : [];
    }

    return [];
  }
}
