/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Service} from '@ophidian/core';
import {Plugin} from 'obsidian';
import {DateTime} from 'luxon';
import alasql from 'alasql';
import {LoggingService} from 'lib/LoggingService';
import {MetricsService} from 'lib/MetricsService';

/**
 * Service for tracking and measuring metrics related to plugin performance.
 */
export class RenderTrackerService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.RenderTrackerService');
  metrics = this.use(MetricsService);

  pageReplacement: Record<string, [DateTime, string]> = {};
  private readonly minDate = DateTime.fromSeconds(0);

  public async setReplacementTime(page: string, id: string, time: DateTime): Promise<void> {
    console.log('setReplacementTime', [page, id, time]);

    if (await this.hasReplacementTime(page, id)) {
      const result = await alasql.promise('UPDATE qatt.RenderTracker SET time = ?, page = ?, id = ? WHERE path = ? AND id = ?', [
        time,
        page,
        id,
        page,
        id,
      ]);
      console.log('setReplacementTime UPDATE', result);
    } else {
      const result = await alasql.promise('INSERT INTO qatt.RenderTracker VALUES ?', [{
        time,
        page,
        id,
      }]);
      console.log('setReplacementTime INSERT', result);
    }
  }

  public async updatedToday(page: string, id: string): Promise<boolean> {
    if (await this.hasReplacementTime(page, id)) {
      const replacementTime = await this.getReplacementTime(page, id);

      if (replacementTime && replacementTime.year === DateTime.now().year
      && replacementTime.month === DateTime.now().month
      && replacementTime.day === DateTime.now().day) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retrieves the plugin metrics as a formatted string.
   * @returns A string containing the plugin metrics.
   */
  public getReplacementDetails(): string {
    const pageReplacement = Object.entries(this.pageReplacement)
      .map(([page, [loadTime, data]]) => `${page}: ${loadTime.toString()} - ${data}`)
      .join('\n');

    return `
  ${pageReplacement}
  `;
  }

  private async hasReplacementTime(page: string, id: string): Promise<boolean> {
    const timeForPageAndId = await this.getReplacementTime(page, id);

    if (timeForPageAndId === undefined) {
      return false;
    }

    return true;
  }

  private async getReplacementTime(page: string, id: string): Promise<DateTime | undefined> {
    console.log('getReplacementTime', [page, id]);
    console.log('getReplacementTime', `SELECT TOP 1 time FROM qatt.RenderTracker WHERE page = '${page}' AND id = '${id}'`);

    const timeForPageAndId = await alasql.promise(`SELECT TOP 1 time FROM qatt.RenderTracker WHERE page = '${page}' AND id = '${id}'`);
    console.log('getReplacementTime timeForPageAndId', timeForPageAndId);
    if (timeForPageAndId.length > 0) {
      return timeForPageAndId[0].time as DateTime;
    }

    return undefined;
  }
}
