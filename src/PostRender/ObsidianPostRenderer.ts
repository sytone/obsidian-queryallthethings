import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {type App, MarkdownPreviewView, type Component} from 'obsidian';

export class ObsidianPostRenderer implements IPostRenderer {
  /**
   * @param app - The Obsidian application instance.
   */
  constructor(private readonly app: App) {}

  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    await MarkdownPreviewView.render(this.app, renderResults, element, sourcePath, component);
    return element.innerHTML;
  }
}

