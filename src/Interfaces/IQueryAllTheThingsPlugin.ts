import {type App, type Command, type EventRef, type MarkdownPostProcessor, type MarkdownPostProcessorContext, type Plugin} from 'obsidian';

export interface IQueryAllTheThingsPlugin extends Plugin {

  app: App;

  saveData(data: any): Promise<void>;
  onload(): any;
  onunload(): void;
  loadSettings(): any;
  saveSettings(): any;

  registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;
  addCommand(command: Command): Command;
  registerEvent(eventRef: EventRef): void;
}
