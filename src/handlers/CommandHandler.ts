import alasql from 'alasql';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';
import { logging } from 'lib/logging';

export class CommandHandler {
  logger = logging.getLogger('Qatt.CommandHandler');

  constructor (
        private plugin: IQueryAllTheThingsPlugin,
        private settingsManager: ISettingsManager) {

  }

  setup (): void {
    this.plugin.addCommand({
      id: 'qatt-force-codeblock-refresh',
      name: 'Force a refresh of all blocks for QATT',
      callback: () => {
        this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
      }
    });

    this.plugin.addCommand({
      id: 'qatt-push-internal-events-to-console',
      name: 'Will push all the internal events to the console for debugging.',
      callback: () => {
        const limit = this.settingsManager.getValue('internallogging_eventstoconsolelimit') as number;
        const res = alasql(`SELECT TOP ${limit} * FROM qatt.Events`);
        this.logger.info('Internal Events', res);
      }
    });

    // this.plugin.addCommand({
    //     id: 'sample-editor-command',
    //     name: 'Sample editor command',
    //     editorCallback: (editor: Editor, view: MarkdownView) => {
    //         console.log(editor.getSelection());
    //         editor.replaceSelection('Sample Editor Command');
    //     }
    // });

    // this.plugin.addCommand({
    //     id: 'open-sample-modal-complex',
    //     name: 'Open sample modal (complex)',
    //     checkCallback: (checking: boolean) => {
    //         // Conditions to check
    //         const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    //         if (markdownView) {
    //             // If checking is true, we're simply "checking" if the command can be run.
    //             // If checking is false, then we want to actually perform the operation.
    //             if (!checking) {
    //                 new SampleModal(this.app).open();
    //             }

    //             // This command will only show up in Command Palette when the check function returns true
    //             return true;
    //         }
    //     }
    // });
  }
}
