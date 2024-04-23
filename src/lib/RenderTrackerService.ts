import {Service} from '@ophidian/core';
import {Plugin} from 'obsidian';
import {DateTime} from 'luxon';

/**
 * Service for tracking and measuring metrics related to plugin performance.
 */
export class RenderTrackerService extends Service {
  plugin = this.use(Plugin);

  pageReplacement: Record<string, [DateTime, string]> = {};

  public setReplacementTime(page: string, id: string, time: DateTime): void {
    this.pageReplacement[`${page}-${id}`] = [time, ''];
  }

  public updatedToday(page: string, id: string): boolean {
    console.log(this.pageReplacement);
    if (this.pageReplacement[`${page}-${id}`] === undefined) {
      return false;
    }

    return DateTime.now().hasSame(this.pageReplacement[`${page}-${id}`][0], 'day');
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
}
