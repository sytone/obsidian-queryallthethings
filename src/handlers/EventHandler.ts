/* eslint-disable no-useless-constructor */
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';
import {
  EventRef,
  debounce
} from 'obsidian';

export default class EventHandler {
  private creationEvent: EventRef | undefined;
  private deletionEvent: EventRef | undefined;
  private modificationEvent: EventRef | undefined;
  private renameEvent: EventRef | undefined;

  constructor (
    private plugin: IQueryAllTheThingsPlugin,
    private settingsManager: ISettingsManager) {
  }

  setup (): void {
    this.updateRefreshSettings();
    this.plugin.app.workspace.onLayoutReady(() => {
      this.updateCreationEvent();
      this.updateDeletionEvent();
      this.updateModificationEvent();
      this.updateRenameEvent();
    });
  }

  private debouncedRefresh: () => void = () => null;
  private updateRefreshSettings () {
    this.debouncedRefresh = debounce(
      () => this.plugin.app.workspace.trigger('qatt:refresh-codeblocks'),
      this.settingsManager.getValue('refreshDebounce') as number,
      true
    );
  }

  updateCreationEvent (): void {
    this.creationEvent = this.plugin.app.vault.on('create', () => {
      this.debouncedRefresh();
      this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.creationEvent);
  }

  updateDeletionEvent (): void {
    this.deletionEvent = this.plugin.app.vault.on('delete', () => {
      this.debouncedRefresh();
      this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.deletionEvent);
  }

  updateModificationEvent (): void {
    this.modificationEvent = this.plugin.app.vault.on('modify', () => {
      this.debouncedRefresh();
      this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.modificationEvent);
  }

  updateRenameEvent (): void {
    this.renameEvent = this.plugin.app.vault.on('rename', () => {
      this.debouncedRefresh();
      this.plugin.app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.renameEvent);
  }
}
