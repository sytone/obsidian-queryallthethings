import {Service} from '@ophidian/core';
import {Plugin} from 'obsidian';
import {DateTime} from 'luxon';

/**
 * Service for tracking and measuring metrics related to plugin performance.
 */
export class MetricsService extends Service {
  plugin = this.use(Plugin);

  lastCreation: DateTime;
  tableLoadTimes: Record<string, number> = {};
  pluginLoadTime: number;
  cacheLoadTime: number;
  measurements: Record<string, number> = {};

  constructor() {
    super();
    this.lastCreation = DateTime.now();
  }

  /**
   * Sets the load time for a specific table.
   * @param tableName - The name of the table.
   * @param loadTime - The load time in milliseconds.
   */
  public setTableLoadTime(tableName: string, loadTime: number): void {
    this.tableLoadTimes[tableName] = loadTime;
  }

  /**
   * Starts a measurement with the given name.
   * @param name - The name of the measurement.
   */
  public startMeasurement(name: string): void {
    this.measurements[name] = performance.now();
  }

  /**
   * Ends the measurement for the specified metric.
   * @param name - The name of the metric.
   */
  public endMeasurement(name: string): void {
    this.measurements[name] = performance.now() - this.measurements[name];
  }

  /**
   * Retrieves the measurement value for the specified name.
   * @param name - The name of the measurement.
   * @returns The measurement value.
   */
  public getMeasurement(name: string): number {
    return this.measurements[name];
  }

  /**
   * Retrieves the plugin metrics as a formatted string.
   * @returns A string containing the plugin metrics.
   */
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
