import {type IPostRenderer} from 'PostRender/IPostRenderer';

export class HtmlPostRenderer implements IPostRenderer {
  public async renderMarkdown(renderResults: string, element: HTMLElement, sourcePath: string) {
    element.innerHTML = renderResults;
    return renderResults;
  }
}

