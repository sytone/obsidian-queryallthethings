import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {type Component} from 'obsidian';

export class RawPostRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    element.textContent = renderResults;
    return renderResults;
  }
}

