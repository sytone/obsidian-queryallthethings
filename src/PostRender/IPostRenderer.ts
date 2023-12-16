import {type Component} from 'obsidian';

// Standard interface for all post renderers. The element children should be updated as needed.
export interface IPostRenderer {
  renderMarkdown: (renderResults: string, element: HTMLElement, sourcePath: string, component: Component) => Promise<string>;
}
