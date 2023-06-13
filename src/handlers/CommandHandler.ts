
import alasql from 'alasql';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {type ISettingsManager} from 'Interfaces/ISettingsManager';
import {logging} from 'lib/Logging';

export class CommandHandler {
  logger = logging.getLogger('Qatt.CommandHandler');

  constructor(
    private readonly plugin: IQueryAllTheThingsPlugin,
    private readonly settingsManager: ISettingsManager) {}

  setup(): void {
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
        const limit = this.settingsManager.getValue('internalLoggingConsoleLogLimit') as number;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = alasql(`SELECT TOP ${limit} * FROM qatt.Events ORDER BY date desc`);
        this.logger.info('Internal Events', result);
      },
    });

    this.plugin.addCommand({
      id: 'dump-tasks-to-console',
      name: 'Will push all the internal tasks table to the console for debugging.',
      callback: () => {
        this.logger.info('tasks', alasql('SELECT * FROM tasks'));
      },
    });

    this.plugin.addCommand({
      id: 'dump-lists-to-console',
      name: 'Will push all the internal lists table to the console for debugging.',
      callback: () => {
        this.logger.info('lists', alasql('SELECT * FROM lists'));
      },
    });

    this.plugin.addCommand({
      id: 'dump-reference=calendar-to-console',
      name: 'Will push all the internal qatt.ReferenceCalendar table to the console for debugging.',
      callback: () => {
        this.logger.info('qatt.ReferenceCalendar', alasql('SELECT * FROM qatt.ReferenceCalendar'));
      },
    });

    this.plugin.addCommand({
      id: 'toggle-debug-logging',
      name: 'Will toggle the debug logging level on and off.',
      callback: () => {
        const enabled = this.settingsManager.toggleDebug();
        this.logger.info('Debugging enabled:', enabled);
      },
    });
  }
}
