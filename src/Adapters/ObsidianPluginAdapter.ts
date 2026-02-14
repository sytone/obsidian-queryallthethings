import type {App, Plugin, EventRef, MarkdownPostProcessor, MarkdownPostProcessorContext, Command} from 'obsidian';
import type {IPluginAdapter} from './IPluginAdapter';

/**
 * Obsidian implementation of the IPluginAdapter interface.
 * Wraps the Obsidian Plugin API to provide a consistent interface.
 */
export class ObsidianPluginAdapter implements IPluginAdapter {
  constructor(
    private readonly app: App,
    private readonly plugin: Plugin
  ) {}

  registerEvent(eventRef: EventRef): void {
    this.plugin.registerEvent(eventRef);
  }

  registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void,
    sortOrder?: number
  ): MarkdownPostProcessor {
    return this.plugin.registerMarkdownCodeBlockProcessor(language, handler, sortOrder);
  }

  addCommand(command: Command): Command {
    return this.plugin.addCommand(command);
  }

  addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => any): HTMLElement {
    return this.plugin.addRibbonIcon(icon, title, callback);
  }

  isPluginEnabled(pluginId: string): boolean {
    return this.app.plugins.enabledPlugins.has(pluginId);
  }
}
