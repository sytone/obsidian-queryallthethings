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

  public setReplacementTime(page: string, id: string, time: DateTime): void {
    console.log('setReplacementTime', [page, id, time]);

    if (this.hasReplacementTime(page, id)) {
      const result = alasql('UPDATE qatt.RenderTracker SET time = ?, page = ?, id = ? WHERE path = ? AND id = ?', [
        time,
        page,
        id,
        page,
        id,
      ]);
      console.log('setReplacementTime UPDATE', result);
    } else {
      const result = alasql('INSERT INTO qatt.RenderTracker VALUES ?', [{
        time,
        page,
        id,
      }]);
      console.log('setReplacementTime INSERT', result);
    }
  }

  public updatedToday(page: string, id: string): boolean {
    if (this.hasReplacementTime(page, id)) {
      const replacementTime = this.getReplacementTime(page, id);

      // Tried hasSame as an approach but did not work, no idea why
      // and do not have time to debug. This is simple and works.
      if (DateTime.fromISO(replacementTime).year === DateTime.now().year
      && DateTime.fromISO(replacementTime).month === DateTime.now().month
      && DateTime.fromISO(replacementTime).day === DateTime.now().day) {
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

  private hasReplacementTime(page: string, id: string): boolean {
    const timeForPageAndId = this.getReplacementTime(page, id);

    if (timeForPageAndId === undefined) {
      return false;
    }

    return true;
  }

  private getReplacementTime(page: string, id: string): DateTime | undefined {
    const timeForPageAndId = alasql('SELECT time FROM qatt.RenderTracker WHERE page = ? AND id = ?', [page, id]);
    if (timeForPageAndId.length > 0) {
      return timeForPageAndId[0].time as DateTime;
    }

    return undefined;
  }
}
