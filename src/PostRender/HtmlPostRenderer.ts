import {type IPostRenderer} from 'PostRender/IPostRenderer';
import {type Component} from 'obsidian';

export class HtmlPostRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string, component: Component) {
    element.innerHTML = renderResults;
    return renderResults;
  }
}

