import alasql from 'alasql';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {Service} from '@ophidian/core';
import {type CachedMetadata, Notice, Plugin, type TFile} from 'obsidian';

export class WindowFunctionsService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.WindowFunctionsService');

  onload(): void {
    this.attachFunctions();
  }

  attachFunctions() {
    window.qattUpdateOriginalTask = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
      nextStatus = nextStatus === '' ? ' ' : nextStatus;

      const rawFileText = await app.vault.adapter.read(page);
      const hasRN = rawFileText.contains('\r');
      const fileText = rawFileText.split(/\r?\n/u);

      if (fileText.length < line) {
        return;
      }

      fileText[line] = fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`);

      const newText = fileText.join(hasRN ? '\r\n' : '\n');
      await app.vault.adapter.write(page, newText);
      app.workspace.trigger('dataview:refresh-views');
      app.workspace.trigger('qatt:refresh-codeblocks');
    };

    // eslint-disable-next-line max-params
    window.qattUpdateOriginalTaskWithAppend = async function (page: string, line: number, currentStatus: string, nextStatus: string, append: string) {
      nextStatus = nextStatus === '' ? ' ' : nextStatus;

      const rawFileText = await app.vault.adapter.read(page);
      const hasRN = rawFileText.contains('\r');
      const fileText = rawFileText.split(/\r?\n/u);

      if (fileText.length < line) {
        return;
      }

      fileText[line] = `${fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`)}${append}`;

      const newText = fileText.join(hasRN ? '\r\n' : '\n');
      await app.vault.adapter.write(page, newText);
      app.workspace.trigger('dataview:refresh-views');
      app.workspace.trigger('qatt:refresh-codeblocks');
    };

    window.qattUpdateOriginalTaskWithDoneDate = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
      nextStatus = nextStatus === '' ? ' ' : nextStatus;

      const rawFileText = await app.vault.adapter.read(page);
      const hasRN = rawFileText.contains('\r');
      const fileText = rawFileText.split(/\r?\n/u);

      if (fileText.length < line) {
        return;
      }

      if (nextStatus === 'x' && !fileText[line].includes('✅')) {
        const doneDate = new Date().toISOString().split('T')[0];
        fileText[line] = `${fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`)} ✅ ${doneDate}`;
      } else {
        fileText[line] = `${fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`)}`;
      }

      if (nextStatus !== 'x' && fileText[line].includes('✅')) {
        const donePrefixIndex = fileText[line].lastIndexOf('✅');
        fileText[line] = fileText[line].slice(0, donePrefixIndex) + fileText[line].slice(donePrefixIndex + 12);
      }

      const newText = fileText.join(hasRN ? '\r\n' : '\n');
      await app.vault.adapter.write(page, newText);
      app.workspace.trigger('dataview:refresh-views');
      app.workspace.trigger('qatt:refresh-codeblocks');
    };
  }
}
