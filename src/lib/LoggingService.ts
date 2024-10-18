/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {DateTime} from 'luxon';
import {type ILogOptions} from 'Interfaces/Settings';
import {Service} from '@ophidian/core';
import {Plugin} from 'obsidian';

/**
 * All possible log levels
 * @public
 */
export interface ILogLevel {
  1: 'trace';
  2: 'debug';
  3: 'info';
  4: 'warn';
  5: 'error';
}

/**
 * Log level IDs (1 - 5)
 * @public
 */
export type TLogLevelId = keyof ILogLevel;

/**
 * Log level names (trace - error)
 * @public
 */
export type TLogLevelName = ILogLevel[TLogLevelId];

export interface ILogEntry {
  traceId?: string;
  level: string;
  module?: string;
  location?: string;
  message: string;
  objects?: any;
}

export class LoggingService extends Service {
  plugin = this.use(Plugin);
  private options: ILogOptions = {
    minLevels: {
      '': 'info',
      Qatt: 'info',
    },
  };

  private readonly levels: Record<string, number> = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
  };

  public getLogger(loggerName: string): Logger {
    return new Logger(loggerName, this.getLoggingLevel(loggerName));
  }

  /**
   * Set the minimum log levels for the module name or global.
   *
   * @param {ILogOptions} options
   * @return {*}  {LogManager}
   * @memberof LoggingService
   */
  public configure(options: ILogOptions) {
    this.options = Object.assign({}, this.options, options);
    return this;
  }

  /**
   * Returns a logger instance for the given module name.
   *
   * @param {string} module
   * @return {*}  {Logger}
   * @memberof LoggingService
   */
  public getLoggingLevel(module: string): number {
    let minLevel = 'none';
    let match = '';

    for (const key in this.options.minLevels) {
      if (module.startsWith(key) && key.length >= match.length) {
        minLevel = this.options.minLevels[key];
        match = key;
      }
    }

    if (minLevel.toLowerCase() in this.levels) {
      return this.levels[minLevel.toLowerCase()];
    }

    return 99;
  }
}

export class Logger {
  private minLevel: number;
  private readonly levels: Record<string, number> = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
  };

  constructor(private readonly loggerName: string, private readonly defaultLevel: number = 3) {
    this.minLevel = defaultLevel;
  }

  public setLogLevel(level: string) {
    if (level.toLowerCase() in this.levels) {
      this.minLevel = this.levels[level.toLowerCase()];
    }
  }

  public trace(message: string, objects?: any): void {
    this.log({level: 'trace', message, objects});
  }

  public debug(message: string, objects?: any): void {
    this.log({level: 'debug', message, objects});
  }

  public info(message: string, objects?: any): void {
    this.log({level: 'info', message, objects});
  }

  public warn(message: string, objects?: any): void {
    this.log({level: 'warn', message, objects});
  }

  public error(message: string, objects?: any): void {
    this.log({level: 'error', message, objects});
  }

  public groupId(traceId: string): void {
    // Disabled for the moment.
    // console.groupCollapsed(`${traceId}`);
  }

  public groupEndId(): void {
    // Disabled for the moment.
    // console.groupEnd();
  }

  public traceWithId(traceId: string, message: string, objects?: any): void {
    this.log({level: 'trace', traceId, message, objects});
  }

  public debugWithId(traceId: string, message: string, objects?: any): void {
    this.log({level: 'debug', traceId, message, objects});
  }

  public infoWithId(traceId: string, message: string, objects?: any): void {
    this.log({level: 'info', traceId, message, objects});
  }

  public warnWithId(traceId: string, message: string, objects?: any): void {
    this.log({level: 'warn', traceId, message, objects});
  }

  public errorWithId(traceId: string, message: string, objects?: any): void {
    this.log({level: 'error', traceId, message, objects});
  }

  public log(logEntry: ILogEntry): void {
    const level = this.levelToInt(logEntry.level);
    if (level < this.minLevel) {
      return;
    }

    // Const logTime = `[${DateTime.now().toFormat('yyyyLLddHHmmssSSS') ?? ''}]`;
    const logTime = `[${DateTime.now().toFormat('HH:mm:ss.SSS') ?? ''}]`;
    const logModule = logEntry.module === undefined ? `[${this.loggerName}]` : `[${logEntry.module}]`;
    const logTraceId = logEntry.traceId === undefined ? '' : `[${logEntry.traceId ?? ''}]`;

    if (logEntry.objects === undefined) {
      logEntry.objects = '';
    }

    switch (logEntry.level) {
      case 'trace': {
        const displayMessage = `\u001B[96m${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}\u001B[m`;
        console.trace(displayMessage, logEntry.objects);
        break;
      }

      case 'debug': {
        const displayMessage = `\u001B[31m${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}\u001B[m`;
        console.debug(displayMessage, logEntry.objects);
        break;
      }

      case 'info': {
        const displayMessage = `${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}`;
        console.info(displayMessage, logEntry.objects);
        break;
      }

      case 'warn': {
        const displayMessage = `${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}`;
        console.warn(displayMessage, logEntry.objects);
        break;
      }

      case 'error': {
        const displayMessage = `${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}`;
        console.error(displayMessage, logEntry.objects);
        break;
      }

      default: {
        const displayMessage = `${logTime}[${logEntry.level}]${logModule}${logTraceId} ${logEntry.message}`;
        console.log(`{${logEntry.level}} ${displayMessage}`, logEntry.objects);
      }
    }
  }

  /**
   * Converts a string level (trace/debug/info/warn/error) into a number
   *
   * @param minLevel
   */
  private levelToInt(minLevel: string): number {
    if (minLevel.toLowerCase() in this.levels) {
      return this.levels[minLevel.toLowerCase()];
    }

    return 99;
  }
}
