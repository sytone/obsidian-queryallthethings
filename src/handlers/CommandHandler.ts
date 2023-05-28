
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
      id: 'qatt-force-codeblock-refresh',
      name: 'Force a refresh of all blocks for QATT',
      callback: () => {
        this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
      },
    });

    this.plugin.addCommand({
      id: 'qatt-push-internal-events-to-console',
      name: 'Will push all the internal events to the console for debugging.',
      callback: () => {
        const limit = this.settingsManager.getValue('internalLoggingConsoleLogLimit') as number;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = alasql(`SELECT TOP ${limit} * FROM qatt.Events ORDER BY date desc`);
        this.logger.info('Internal Events', result);
      },
    });
  }
}
