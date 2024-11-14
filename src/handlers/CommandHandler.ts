
import alasql from 'alasql';
import {LoggingService} from 'lib/LoggingService';
import {Service} from '@ophidian/core';
import {type Editor, type MarkdownView, Plugin} from 'obsidian';
import {WindowFunctionsService} from 'lib/WindowFunctionsService';
import {MetricsService} from 'lib/MetricsService';

export class CommandHandler extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.CommandHandler');
  metrics = this.use(MetricsService);

  windowFunctions = this.use(WindowFunctionsService);

  public setup(internalLoggingConsoleLogLimit: number): void {
    const commands = [
      {
        id: 'dump-metrics-to-console',
        name: 'Report the metrics for the plugin to the console',
        callback: () => {
          this.logger.info('Plugin Metrics', this.metrics.getPluginMetrics());
        },
      },
      {
        id: 'dump-metrics-to-editor',
        name: 'Report the metrics for the plugin to the editor',
        editorCallback: (editor: Editor) => {
          editor.replaceRange(
            this.metrics.getPluginMetrics(),
            editor.getCursor(),
          );
        },
      },
      {
        id: 'force-codeblock-refresh',
        name: 'Force a refresh of all blocks for QATT',
        callback: () => {
          this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
        },
      },
      {
        id: 'force-cache-reload',
        name: 'Force the notes cache to be reloaded',
        callback: () => {
          this.plugin.app.workspace.trigger('qatt:force-cache-reload');
        },
      },

      {
        id: 'push-internal-events-to-console',
        name: 'Will push all the internal events to the console for debugging.',
        callback: async () => {
          const limit = internalLoggingConsoleLogLimit;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = await alasql.promise(`SELECT TOP ${limit} * FROM qatt.Events ORDER BY date desc`);
          this.logger.info('Internal Events', result);
        },
      },
      {
        id: 'dump-tasks-to-console',
        name: 'Will push all the internal obsidian_markdown_tasks table to the console for debugging.',
        callback: async () => {
          this.logger.info('tasks', await alasql.promise('SELECT * FROM obsidian_tasks'));
        },
      },
      {
        id: 'dump-lists-to-console',
        name: 'Will push all the internal obsidian_markdown_lists table to the console for debugging.',
        callback: async () => {
          this.logger.info('lists', await alasql.promise('SELECT * FROM obsidian_lists'));
        },
      },
      {
        id: 'dump-tables-to-editor',
        name: 'Dump the in memory tables known by Alasql to the editor',
        async editorCallback(editor: Editor) {
          const results = await alasql.promise('SHOW TABLES'); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          let table = '';

          const keys = Object.keys(results[0] || {});
          const width = keys.length;
          table += '| ';
          for (let h = 0; h < width; h++) {
            table += keys[h] + ' | ';
          }

          table += '\n';
          table += '| ';
          for (let h = 0; h < width; h++) {
            table += '--- | ';
          }

          table += '\n';

          for (const row of results) {
            table += '| ';
            for (let i = 0; i < width; i++) {
              table += row[keys[i]] + ' | ';
            }

            table += '\n';
          }

          console.log(table);

          editor.replaceRange(
            table,
            editor.getCursor(),
          );
        },
      },
      {
        id: 'dump-reference-calendar-to-console',
        name: 'Will push all the internal qatt.ReferenceCalendar table to the console for debugging.',
        callback: async () => {
          this.logger.info('qatt.ReferenceCalendar', await alasql.promise('SELECT * FROM qatt.ReferenceCalendar'));
        },
      },
      {
        id: 'dump-reference-calendar-to-editor',
        name: 'Will push all the internal qatt.ReferenceCalendar table to the editor for debugging.',
        async editorCallback(editor: Editor) {
          const results = await alasql.promise('SELECT TOP 10 * FROM qatt.ReferenceCalendar'); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          let table = '';

          const keys = Object.keys(results[0] || {});
          const width = keys.length;
          table += '| ';
          for (let h = 0; h < width; h++) {
            table += keys[h] + ' | ';
          }

          table += '\n';
          table += '| ';
          for (let h = 0; h < width; h++) {
            table += '--- | ';
          }

          table += '\n';

          for (const row of results) {
            table += '| ';
            for (let i = 0; i < width; i++) {
              table += row[keys[i]] + ' | ';
            }

            table += '\n';
          }

          editor.replaceRange(
            table,
            editor.getCursor(),
          );
        },
      },
      {
        id: 'qatt-internal-reload-window-functions',
        name: 'Internal - Reload Window Level Functions',
        callback: () => {
          this.windowFunctions.attachFunctions();
        },
      },
      {
        id: 'qatt-show-updates',
        name: 'Show recent updates to the plugin',
        callback: () => {
          this.plugin.announceUpdate();
        },
      },
    ];

    for (const command of commands) {
      this.plugin.addCommand(command);
    }
  }
}
