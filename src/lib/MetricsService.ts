import {Service} from '@ophidian/core';
import {Plugin} from 'obsidian';
import {type QattCodeBlock} from 'QattCodeBlock';
import {LoggingService} from 'lib/LoggingService';
import {DateTime} from 'luxon';

export class MetricsService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.MetricsService');

  lastCreation: DateTime;
  tableLoadTimes: Record<string, number> = {};
  pluginLoadTime: number;
  cacheLoadTime: number;

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  public setTableLoadTime(tableName: string, loadTime: number): void {
    this.tableLoadTimes[tableName] = loadTime;
  }

  public getPluginMetrics(): string {
    const tableLoadTimes = Object.entries(this.tableLoadTimes)
      .map(([tableName, loadTime]) => `${tableName}: ${loadTime}ms`)
      .join('\n');

    return `\nPlugin Load Time: ${this.pluginLoadTime}ms\nNotes Cache Load Time: ${this.cacheLoadTime}ms\nTable Load Times\n${tableLoadTimes}`;
  }
}
