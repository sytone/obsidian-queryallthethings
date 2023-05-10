import { App } from "obsidian";

export interface IQueryAllTheThingsPlugin {

    app: App;

    saveData(data: any): Promise<void>;
    onload(): any;
    onunload(): void;
    loadSettings(): any;
    saveSettings(): any;

    registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;

}
