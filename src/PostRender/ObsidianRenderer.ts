import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {MarkdownPreviewView, type Component} from 'obsidian';

export class ObsidianRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    await MarkdownPreviewView.renderMarkdown(renderResults, element, sourcePath, component);
  }
}

