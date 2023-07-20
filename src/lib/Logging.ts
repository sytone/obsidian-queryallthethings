/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint indent: [2, 2, {"SwitchCase": 1}] */
import {DateTime} from 'luxon';
/*
 * EventEmitter2 is an implementation of the EventEmitter module found in Node.js.
 * In addition to having a better benchmark performance than EventEmitter and being
 * browser-compatible, it also extends the interface of EventEmitter with many
 * additional non-breaking features.
 *
 * This has been added as EventEmitter in Node.JS is not available in the browser.
 * https://www.npmjs.com/package/eventemitter2
 * Also thanks to https://learnshareit.com/how-to-solve-the-requested-module-does-not-provide-an-export-named-in-javascript/
 * this now works in jest testing with ESM modules.
 */
import {type ILogOptions} from 'Interfaces/Settings';
import {EventEmitter2} from 'eventemitter2';

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
 * Logger class to handle consistency of logs across the plugin.
 *
 * @export
 * @interface LogEntry
 */
export interface ILogEntry {
  traceId?: string;
  level: string;
  module: string;
  location?: string;
  message: string;
  objects: any;
}

/**
 * Standard logging interface.
 *
 * @export
 * @interface Logger
 */
export interface ILogger {
  setLogLevel (level: string): void;
  log (logLevel: string, message: string, objects?: any): void;
  trace (message: string, objects?: any): void;
  debug (message: string, objects?: any): void;
  info (message: string, objects?: any): void;
  warn (message: string, objects?: any): void;
  error (message: string, objects?: any): void;
  logWithId (logLevel: string, traceId: string, message: string, objects?: any): void;
  traceWithId (traceId: string, message: string, objects?: any): void;
  debugWithId (traceId: string, message: string, objects?: any): void;
  infoWithId (traceId: string, message: string, objects?: any): void;
  warnWithId (traceId: string, message: string, objects?: any): void;
  errorWithId (traceId: string, message: string, objects?: any): void;
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

/**
 * Logger class to handle consistency of logs across the plugin.
 *
 * @export
 * @class LogManager
 * @extends {EventEmitter2}
 */
export class LogManager extends EventEmitter2 {
  private options: ILogOptions = {
    minLevels: {

      '': 'info',

      Qatt: 'info',
    },
  };

  // Prevent the console logger from being added twice
  private consoleLoggerRegistered = false;

  /**
   * Set the minimum log levels for the module name or global.
   *
   * @param {ILogOptions} options
   * @return {*}  {LogManager}
   * @memberof LogManager
   */
  public configure(options: ILogOptions): this {
    this.options = Object.assign({}, this.options, options);
    return this;
  }

  /**
   * Returns a logger instance for the given module name.
   *
   * @param {string} module
   * @return {*}  {Logger}
   * @memberof LogManager
   */
  public getLogger(module: string): ILogger {
    let minLevel = 'none';
    let match = '';

    for (const key in this.options.minLevels) {
      if (module.startsWith(key) && key.length >= match.length) {
        minLevel = this.options.minLevels[key];
        match = key;
      }
    }

    return new QattLogger(this, module, minLevel);
  }

  /**
   *
   *
   * @param {(logEntry: ILogEntry) => void} listener
   * @return {*}  {LogManager}
   * @memberof LogManager
   */
  public onLogEntry(listener: (logEntry: ILogEntry) => void): this {
    this.on('log', listener);
    return this;
  }

  // Private period: number = 0;
  arrAvg = (array: number[]) => array.reduce((a, b) => a + b, 0) / array.length;

  /**
   * Registers a logger that write to the console.
   *
   * @return {*}  {LogManager}
   * @memberof LogManager
   */
  public registerConsoleLogger(): this {
    if (this.consoleLoggerRegistered) {
      return this;
    }

    this.onLogEntry(logEntry => {
      let message = `[${DateTime.now().toISO() ?? ''}][${logEntry.level}][${logEntry.module}]`;

      if (logEntry.traceId) {
        message += `[${logEntry.traceId}]`;
      }

      message += ` ${logEntry.message}`;
      if (logEntry.objects === undefined) {
        logEntry.objects = '';
      }

      switch (logEntry.level) {
        case 'trace': {
          console.trace(message, logEntry.objects);
          break;
        }

        case 'debug': {
          console.debug(message, logEntry.objects);
          break;
        }

        case 'info': {
          console.info(message, logEntry.objects);
          break;
        }

        case 'warn': {
          console.warn(message, logEntry.objects);
          break;
        }

        case 'error': {
          console.error(message, logEntry.objects);
          break;
        }

        default: {
          console.log(`{${logEntry.level}} ${message}`, logEntry.objects);
        }
      }
    });

    this.consoleLoggerRegistered = true;
    return this;
  }
}

export const logging = new LogManager();

/**
 * Main logging library, to view the logs a logger listener must be added. The
 * Console Logger is already implemented for this project.
 *
 * @export
 * @class Logger
 */
export class QattLogger implements ILogger {
  private minLevel: number;
  private readonly levels: Record<string, number> = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
  };

  /**
   * Creates an instance of Logger.
   * @param {EventEmitter2} logManager
   * @param {string} moduleName
   * @param {string} minLevel
   * @memberof Logger
   */
  constructor(private readonly logManager: EventEmitter2, private readonly moduleName: string, minLevel: string) {
    this.minLevel = this.levelToInt(minLevel);
  }

  public setLogLevel(level: string) {
    if (level.toLowerCase() in this.levels) {
      this.minLevel = this.levels[level.toLowerCase()];
    }
  }

  /**
   * Central logging method.
   * @param logLevel
   * @param message
   */
  public log(logLevel: string, message: string, objects?: any): void {
    const level = this.levelToInt(logLevel);
    if (level < this.minLevel) {
      return;
    }

    const logEntry: ILogEntry = {
      level: logLevel,
      module: this.moduleName,
      message,
      objects,
      traceId: undefined,
    };

    // Obtain the line/file through a thoroughly hacky method
    // This creates a new stack trace and pulls the caller from it.  If the caller
    // if .trace()
    // const error = new Error('');
    // if (error.stack) {
    //     const cla = error.stack.split('\n');
    //     let idx = 1;
    //     while (idx < cla.length && cla[idx].includes('at Logger.Object.')) idx++;
    //     if (idx < cla.length) {
    //         logEntry.location = cla[idx].slice(cla[idx].indexOf('at ') + 3, cla[idx].length);
    //     }
    // }

    this.logManager.emit('log', logEntry);
  }

  public trace(message: string, objects?: any): void {
    this.log('trace', message, objects);
  }

  public debug(message: string, objects?: any): void {
    this.log('debug', message, objects);
  }

  public info(message: string, objects?: any): void {
    this.log('info', message, objects);
  }

  public warn(message: string, objects?: any): void {
    this.log('warn', message, objects);
  }

  public error(message: string, objects?: any): void {
    this.log('error', message, objects);
  }

  /**
   * Central logging method with a trace ID to track calls between modules/components.
   * @param logLevel
   * @param message
   */
  public logWithId(
    logLevel: string,
    traceId: string,
    message: string,
    objects?: any,
  ): void {
    const level = this.levelToInt(logLevel);
    if (level < this.minLevel) {
      return;
    }

    const logEntry: ILogEntry = {
      level: logLevel,
      module: this.moduleName,
      message,
      objects,
      traceId,
    };

    this.logManager.emit('log', logEntry);
  }

  public traceWithId(traceId: string, message: string, objects?: any): void {
    this.logWithId('trace', traceId, message, objects);
  }

  public debugWithId(traceId: string, message: string, objects?: any): void {
    this.logWithId('debug', traceId, message, objects);
  }

  public infoWithId(traceId: string, message: string, objects?: any): void {
    this.logWithId('info', traceId, message, objects);
  }

  public warnWithId(traceId: string, message: string, objects?: any): void {
    this.logWithId('warn', traceId, message, objects);
  }

  public errorWithId(traceId: string, message: string, objects?: any): void {
    this.logWithId('error', traceId, message, objects);
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

type TimingMap = Record<string, number[]>;

const timingMap: TimingMap = {};

/**
 * This deceleration will log the time taken to run the function it is attached to. Be
 * careful where it is added as it increases the output.
 *
 * @export
 * @return {*}
 */
export const logCall = (
  target: Record<string, unknown>,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const startTime = new Date(Date.now());
    const result = originalMethod.apply(this, args);
    const endTime = new Date(Date.now());
    const name = `${target?.constructor?.name}${propertyKey}`;
    const time = endTime.getTime() - startTime.getTime();
    if (timingMap[name] === undefined) {
      timingMap[name] = [];
    }

    timingMap[name].push(time);

    // Console.log(timingMap);
    // if (endTime.getTime() - startTime.getTime() > 50) {
    //     console.debug(
    //         `[debug][qatt.perf] ${String(timingMap[name].avg).padEnd(4)}${String(
    //             endTime.getTime() - startTime.getTime(),
    //         ).padEnd(4)} ${target?.constructor?.name.padEnd(10)}${propertyKey.padEnd(20)}`,
    //     );

    //     // logger.debug(
    //     //     `${target?.constructor?.name}:${propertyKey}:called with ${args.length} arguments. Took: ${
    //     //         endTime.getTime() - startTime.getTime()
    //     //     }ms`,
    //     // );
    // }
    return result;
  };

  return descriptor;
};

export function logCallDetails() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = logging.getLogger('Qatt');

    descriptor.value = async function (...args: any[]) {
      const startTime = new Date(Date.now());
      const result = await originalMethod.apply(this, args);
      const endTime = new Date(Date.now());
      const elapsed = endTime.getTime() - startTime.getTime();

      logger.debug(
        `${typeof target}:${propertyKey} called with ${args.length
        } arguments. Took: ${elapsed}ms ${JSON.stringify(args)}`,
      );
      return result;
    };

    return descriptor;
  };
}

/**
 * Provides a simple log function that can be used to log trace messages against default module.
 *
 * @export
 * @param {string} message
 * @param {*} [objects]
 */
export function logTrace(message: string, objects?: any) {
  log('trace', message, objects);
}

/**
 * Provides a simple log function that can be used to log debug messages against default module.
 *
 * @export
 * @param {string} message
 * @param {*} [objects]
 */
export function logDebug(message: string, objects?: any) {
  log('debug', message, objects);
}

/**
 * Provides a simple log function that can be used to log info messages against default module.
 *
 * @export
 * @param {string} message
 * @param {*} [objects]
 */
export function logInfo(message: string, objects?: any) {
  log('info', message, objects);
}

/**
 * Provides a simple log function that can be used to log warn messages against default module.
 *
 * @export
 * @param {string} message
 * @param {*} [objects]
 */
export function logWarn(message: string, objects?: any) {
  log('warn', message, objects);
}

/**
 * Provides a simple log function that can be used to log error messages against default module.
 *
 * @export
 * @param {string} message
 * @param {*} [objects]
 */
export function logError(message: string, objects?: any) {
  log('error', message, objects);
}

/**
 * Provides a simple log function that can be used to log messages against default module.
 *
 * @export
 * @param {TLogLevelName} logLevel
 * @param {string} message
 */
export function log(logLevel: TLogLevelName, message: string, objects?: any) {
  const logger = logging.getLogger('Qatt');

  switch (logLevel) {
    case 'trace': {
      logger.trace(message, objects);
      break;
    }

    case 'debug': {
      logger.debug(message, objects);
      break;
    }

    case 'info': {
      logger.info(message, objects);
      break;
    }

    case 'warn': {
      logger.warn(message, objects);
      break;
    }

    case 'error': {
      logger.error(message, objects);
      break;
    }

    default: {
      break;
    }
  }
}

/**
 * This allows the plugin to be debugged in a mobile application
 * add it when debugging on a device. Not meant to be used by
 * end users. Add it into main.ts and remove before you commit.
 *
 * @export
 * @param {Plugin} plugin
 * @return {*}
 */
// export function monkeyPatchConsole(plugin: Plugin) {
//   if (!Platform.isMobile) {
//     return;
//   }

//   const logFile = `${plugin.manifest.dir ?? '.'}/qatt-logs.txt`;
//   const logs: string[] = [];
//   const logMessages
//     = (prefix: string) =>
//       async (...messages: unknown[]) => {
//         logs.push(`\n[${prefix}]`);
//         for (const message of messages) {
//           logs.push(String(message));
//         }

//         await plugin.app.vault.adapter.write(logFile, logs.join(' '));
//       };

//   console.debug = logMessages('debug');
//   console.error = logMessages('error');
//   console.info = logMessages('info');
//   console.log = logMessages('log');
//   console.warn = logMessages('warn');
// }
