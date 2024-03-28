import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {MarkdownPreviewView, Component} from 'obsidian';

export class ObsidianPostRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string) {
    await MarkdownPreviewView.renderMarkdown(renderResults, element, sourcePath, new Component());
    return element.innerHTML;
  }
}

