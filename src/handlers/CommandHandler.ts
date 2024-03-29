
import alasql from 'alasql';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {Service} from '@ophidian/core';
import {type CachedMetadata, Notice, Plugin, type TFile} from 'obsidian';
import {WindowFunctionsService} from 'lib/WindowFunctionsService';

export class CommandHandler extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.CommandHandler');
  windowFunctions = this.use(WindowFunctionsService);

  public setup(internalLoggingConsoleLogLimit: number): void {
    this.plugin.addCommand({
      id: 'force-codeblock-refresh',
      name: 'Force a refresh of all blocks for QATT',
      callback: () => {
        this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
      },
    });

    this.plugin.addCommand({
      id: 'push-internal-events-to-console',
      name: 'Will push all the internal events to the console for debugging.',
      callback: () => {
        const limit = internalLoggingConsoleLogLimit;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = alasql(`SELECT TOP ${limit} * FROM qatt.Events ORDER BY date desc`);
        this.logger.info('Internal Events', result);
      },
    });

    this.plugin.addCommand({
      id: 'dump-tasks-to-console',
      name: 'Will push all the internal obsidian_markdown_tasks table to the console for debugging.',
      callback: () => {
        this.logger.info('tasks', alasql('SELECT * FROM obsidian_markdown_tasks'));
      },
    });

    this.plugin.addCommand({
      id: 'dump-lists-to-console',
      name: 'Will push all the internal obsidian_markdown_lists table to the console for debugging.',
      callback: () => {
        this.logger.info('lists', alasql('SELECT * FROM obsidian_markdown_lists'));
      },
    });

    this.plugin.addCommand({
      id: 'dump-reference-calendar-to-console',
      name: 'Will push all the internal qatt.ReferenceCalendar table to the console for debugging.',
      callback: () => {
        this.logger.info('qatt.ReferenceCalendar', alasql('SELECT * FROM qatt.ReferenceCalendar'));
      },
    });

    // This adds an editor command that can perform some operation on the current editor instance
    this.plugin.addCommand({
      id: 'qatt-internal-reload-window-functions',
      name: 'Internal - Reload Window Level Functions',
      callback: () => {
        this.windowFunctions.attachFunctions();
      },
    });

    this.plugin.addCommand({
      id: 'qatt-show-updates',
      name: 'Show recent updates to the plugin',
      callback: () => {
        this.plugin.announceUpdate();
      },
    });
  }
}
