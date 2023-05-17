import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';
import {
  EventRef,
  debounce
} from 'obsidian';

export default class EventHandler {
  private creation_event: EventRef | undefined;
  private deletion_event: EventRef | undefined;
  private modification_event: EventRef | undefined;
  private rename_event: EventRef | undefined;

  constructor (
        private plugin: IQueryAllTheThingsPlugin,
        private settingsManager: ISettingsManager) {
  }

  setup (): void {
    this.updateRefreshSettings();
    app.workspace.onLayoutReady(() => {
      this.update_creation_event();
      this.update_deletion_event();
      this.update_modification_event();
      this.update_rename_event();
    });
  }

  private debouncedRefresh: () => void = () => null;
  private updateRefreshSettings () {
    this.debouncedRefresh = debounce(
      () => app.workspace.trigger('qatt:refresh-codeblocks'),
            this.settingsManager.getValue('refreshDebounce') as number,
            true
    );
  }

  update_creation_event (): void {
    this.creation_event = app.vault.on('create', () => {
      this.debouncedRefresh();
      app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.creation_event);
  }

  update_deletion_event (): void {
    this.deletion_event = app.vault.on('delete', () => {
      this.debouncedRefresh();
      app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.deletion_event);
  }

  update_modification_event (): void {
    this.modification_event = app.vault.on('modify', () => {
      this.debouncedRefresh();
      app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.modification_event);
  }

  update_rename_event (): void {
    this.rename_event = app.vault.on('rename', () => {
      this.debouncedRefresh();
      app.workspace.trigger('qatt:refresh-codeblocks');
    });
    this.plugin.registerEvent(this.rename_event);
  }
}
