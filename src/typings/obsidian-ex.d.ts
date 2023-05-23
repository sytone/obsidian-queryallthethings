import 'obsidian';

declare module 'obsidian' {
  interface MetadataCache {
    trigger (...args: Parameters<MetadataCache['on']>): void;
    trigger (name: string, ...data: any[]): void;
    on (name: 'dataview:index-ready', callback: () => void, ctx?: any): EventRef;
    on (name: 'dataview:refresh-views', callback: () => void, ctx?: any): EventRef;
  }

  interface App {
    appId?: string;
    // plugins: {
    //     enabledPlugins: Set<string>;
    //     plugins: {
    //         dataview?: {
    //             api: DataviewApi;
    //         };
    //     };
    // };
  }

  interface Workspace {
    /** Sent to rendered dataview components to tell them to possibly refresh */
    on (name: 'qatt:refresh-codeblocks', callback: () => void, ctx?: any): EventRef;
    on (name: 'dataview:refresh-views', callback: () => void, ctx?: any): EventRef;

  }
}

declare global {
  interface Window {
    DataviewAPI?: DataviewApi;
  }
}
