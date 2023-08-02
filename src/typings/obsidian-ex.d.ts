/* eslint-disable unicorn/filename-case */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-interface */
import _ from 'obsidian';
import {type DataviewApi} from 'obsidian-dataview';

export interface EventRef {

}
declare module 'obsidian' {
  interface MetadataCache {
    trigger (...args: Parameters<MetadataCache['on']>): void;
    trigger (name: string, ...data: any[]): void;
    on (name: 'dataview:index-ready' | 'dataview:refresh-views', callback: () => void, ctx?: any): EventRef;
  }

  interface App {
    appId: string;
    // Plugins: {
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
    on (name:
    'qatt:refresh-codeblocks' |
    'dataview:refresh-views' |
    'qatt:notes-store-update' |
    'qatt:dataview-store-update', callback: () => void, ctx?: any): EventRef;
  }
}

declare global {
  interface Window {

    DataviewAPI?: DataviewApi;
  }
}
