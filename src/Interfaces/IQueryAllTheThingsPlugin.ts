import {type App, type Command, type EventRef, type MarkdownPostProcessor, type MarkdownPostProcessorContext, type Plugin} from 'obsidian';
import {type SettingsManager} from 'Settings/SettingsManager';

export interface IQueryAllTheThingsPlugin extends Plugin {

  app: App;
  settingsManager: SettingsManager | undefined;

  saveData(data: any): Promise<void>;
  onload(): any;
  onunload(): void;
  // LoadSettings(): any;
  // saveSettings(): any;

  registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;
  addCommand(command: Command): Command;
  registerEvent(eventRef: EventRef): void;
}

export interface IQueryAllTheThingsPluginInternal {

  saveData(data: any): Promise<void>;
  onload(): any;
  onunload(): void;
  loadSettings(): any;
  saveSettings(): any;

  registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;
  addCommand(command: Command): Command;
  registerEvent(eventRef: EventRef): void;
}

