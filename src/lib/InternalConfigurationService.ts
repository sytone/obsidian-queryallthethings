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
export class InternalConfigurationService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.InternalConfigurationService');
  metrics = this.use(MetricsService);

  private readonly minDate = DateTime.fromSeconds(0);
  private get internalConfigurationTable() {
    return 'qatt.Configuration';
  }

  public async getValue(key: string): Promise<string | undefined> {
    console.log('getValue', key);
    console.log('getValue', `SELECT TOP 1 configvalue FROM ${this.internalConfigurationTable} WHERE configkey = '${key}' ORDER BY time DESC`);

    const selectValue = await alasql.promise(`SELECT TOP 1 configvalue FROM ${this.internalConfigurationTable} WHERE configkey = '${key} ORDER BY time DESC'`);
    console.log('getValue selectValue', selectValue);
    if (selectValue.length > 0) {
      return selectValue[0].configvalue as string;
    }

    return undefined;
  }

  public async setValue(key: string, value: string): Promise<void> {
    const setTime = DateTime.now();
    console.log('setValue', [key, value, setTime]);

    if (await this.hasValue(key)) {
      const result = await alasql.promise(`UPDATE ${this.internalConfigurationTable} SET time = ?, configvalue = ? WHERE configkey = ?`, [
        setTime,
        value,
        key,
      ]);
      console.log('setValue UPDATE', result);
    } else {
      const result = await alasql.promise(`INSERT INTO ${this.internalConfigurationTable} VALUES ?`, [{
        setTime,
        key,
        value,
      }]);
      console.log('setValue INSERT', result);
    }
  }

  /**
   * Retrieves the plugin metrics as a formatted string.
   * @returns A string containing the plugin metrics.
   */
  public async getConfigurationValues(): Promise<string> {
    const allValues = await alasql.promise(`SELECT * FROM ${this.internalConfigurationTable} ORDER BY time DESC'`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const currentValues = allValues
      .map(([time, configkey, configvalue]) => `${configkey}: ${configvalue} - ${time}`)
      .join('\n') as string;

    return `${currentValues}`;
  }

  private async hasValue(key: string): Promise<boolean> {
    const keyValue = await this.getValue(key);

    if (keyValue === undefined) {
      return false;
    }

    return true;
  }
}
