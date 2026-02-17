import type {EventRef, MarkdownPostProcessor, MarkdownPostProcessorContext, Command} from 'obsidian';
import type {IPluginAdapter} from './IPluginAdapter';

/**
 * Mock implementation of IPluginAdapter for testing.
 * Provides plugin lifecycle simulation without Obsidian dependency.
 */
export class MockPluginAdapter implements IPluginAdapter {
  private readonly events: EventRef[] = [];
  private readonly processors: Array<{language: string; handler: any; sortOrder?: number}> = [];
  private readonly commands: Command[] = [];
  private readonly ribbonIcons: Array<{icon: string; title: string; callback: any}> = [];
  private readonly enabledPlugins = new Set<string>(['dataview', 'customjs']);

  registerEvent(eventRef: EventRef): void {
    this.events.push(eventRef);
  }

  registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, element: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void,
    sortOrder?: number,
  ): MarkdownPostProcessor {
    this.processors.push({language, handler, sortOrder});
    const mockProcessor = {} as const;
    return mockProcessor as MarkdownPostProcessor;
  }

  addCommand(command: Command): Command {
    this.commands.push(command);
    return command;
  }

  addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => any): HTMLElement {
    this.ribbonIcons.push({icon, title, callback});
    return document.createElement('div');
  }

  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  /**
   * Sets whether a plugin is enabled for testing.
   */
  setPluginEnabled(pluginId: string, enabled: boolean): void {
    if (enabled) {
      this.enabledPlugins.add(pluginId);
    } else {
      this.enabledPlugins.delete(pluginId);
    }
  }

  /**
   * Gets registered events for testing.
   */
  getRegisteredEvents(): EventRef[] {
    return this.events;
  }

  /**
   * Gets registered processors for testing.
   */
  getRegisteredProcessors(): Array<{language: string; handler: any; sortOrder?: number}> {
    return this.processors;
  }

  /**
   * Gets registered commands for testing.
   */
  getRegisteredCommands(): Command[] {
    return this.commands;
  }

  /**
   * Gets registered ribbon icons for testing.
   */
  getRegisteredRibbonIcons(): Array<{icon: string; title: string; callback: any}> {
    return this.ribbonIcons;
  }
}
