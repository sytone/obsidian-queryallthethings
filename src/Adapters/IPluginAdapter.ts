import type {EventRef, MarkdownPostProcessor, MarkdownPostProcessorContext, Command} from 'obsidian';

/**
 * Interface for abstracting Obsidian plugin lifecycle operations.
 * This allows for better testing and reduces direct dependency on Obsidian API.
 */
export interface IPluginAdapter {
  /**
   * Registers an event and ensures it gets unloaded properly.
   */
  registerEvent(eventRef: EventRef): void;

  /**
   * Registers a markdown code block processor.
   */
  registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void,
    sortOrder?: number
  ): MarkdownPostProcessor;

  /**
   * Adds a command to the command palette.
   */
  addCommand(command: Command): Command;

  /**
   * Adds a ribbon icon to the left sidebar.
   */
  addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => any): HTMLElement;

  /**
   * Checks if a plugin is enabled.
   */
  isPluginEnabled(pluginId: string): boolean;
}
