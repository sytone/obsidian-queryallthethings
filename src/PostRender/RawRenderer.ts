import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {type Component} from 'obsidian';

export class RawRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    element.textContent = renderResults;
  }
}

