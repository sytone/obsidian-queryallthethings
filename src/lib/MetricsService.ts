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
  measurements: Record<string, number> = {};

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  public setTableLoadTime(tableName: string, loadTime: number): void {
    this.tableLoadTimes[tableName] = loadTime;
  }

  public startMeasurement(name: string): void {
    this.measurements[name] = performance.now();
  }

  public endMeasurement(name: string): void {
    this.measurements[name] = performance.now() - this.measurements[name];
  }

  public getPluginMetrics(): string {
    const tableLoadTimes = Object.entries(this.tableLoadTimes)
      .map(([tableName, loadTime]) => `${tableName}: ${loadTime}ms`)
      .join('\n');

    const measurements = Object.entries(this.measurements)
      .map(([name, time]) => `${name}: ${time}ms`)
      .join('\n');

    return `
Plugin Load Time: ${this.pluginLoadTime}ms
Notes Cache Load Time: ${this.cacheLoadTime}ms
Table Load Times
${tableLoadTimes}
Internal Measurements
${measurements}`;
  }
}
