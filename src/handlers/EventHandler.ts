import {type EventRef, debounce, Plugin} from 'obsidian';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {Service} from '@ophidian/core';

export class EventHandler extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.EventHandler');
  public debouncePeriod = 1000;

  private creationEvent: EventRef | undefined;
  private deletionEvent: EventRef | undefined;
  private modificationEvent: EventRef | undefined;
  private renameEvent: EventRef | undefined;

  public setup(): void {
    this.updateRefreshSettings();
    this.updateCreationEvent();
    this.updateDeletionEvent();
    this.updateModificationEvent();
    this.updateRenameEvent();
  }

  updateCreationEvent(): void {
    this.creationEvent = this.plugin.app.vault.on('create', () => {
      this.debouncedRefresh();
    });
    this.plugin.registerEvent(this.creationEvent);
  }

  updateDeletionEvent(): void {
    this.deletionEvent = this.plugin.app.vault.on('delete', () => {
      this.debouncedRefresh();
    });
    this.plugin.registerEvent(this.deletionEvent);
  }

  updateModificationEvent(): void {
    this.modificationEvent = this.plugin.app.vault.on('modify', () => {
      this.debouncedRefresh();
    });
    this.plugin.registerEvent(this.modificationEvent);
  }

  updateRenameEvent(): void {
    this.renameEvent = this.plugin.app.vault.on('rename', () => {
      this.debouncedRefresh();
    });
    this.plugin.registerEvent(this.renameEvent);
  }

  private debouncedRefresh: () => void = () => null;
  private updateRefreshSettings() {
    this.debouncedRefresh = debounce(
      () => {
        // Aging out the old handlers.
        // this.logger.info('Triggering qatt:refresh-codeblocks.');
        // this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
      },
      this.debouncePeriod,
      true,
    );
  }
}
