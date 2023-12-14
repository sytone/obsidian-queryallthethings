import {type Component} from 'obsidian';

export interface IPostRenderer {
  renderMarkdown: (renderResults: string, element: HTMLElement, sourcePath: string, component: Component) => Promise<void>;
}
