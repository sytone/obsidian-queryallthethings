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
    plugins: {
      enabledPlugins: Set<string>;
    };
  }

  interface Plugin {
    updateWindowLevelFunctions (): void;
    announceUpdate (): void;
  }

  interface Menu {
    dom: HTMLElement;
    items: MenuItem[];
    onMouseOver: (evt: MouseEvent) => void;
  }

  interface MenuItem {
    callback: () => void;
    dom: HTMLElement;
    setSubmenu: () => Menu;
    disabled: boolean;
    setWarning: (warning: boolean) => void;
  }

  export interface PluginManifest {
    releases: Array<Record<string, string>>;
  }

  interface Workspace {
    /** Sent to rendered dataview components to tell them to possibly refresh */
    on (name:
    'qatt:refresh-codeblocks' |
    'dataview:refresh-views' |
    'qatt:notes-store-update' |
    'qatt:dataview-store-update' |
    'qatt:all-notes-loaded' |
    'qatt:force-cache-reload' |
    'qatt:data-refreshtables-completed' |
    'qatt:data-local-database-setup-completed' |
    'qatt:main-settings-first-load-completed' |
    'qatt:main-settings-reload-completed', callback: () => void, ctx?: any): EventRef;
  }
}

declare global {
  interface Window {

    DataviewAPI?: DataviewApi;
    _qatt: any;
    qattUpdateOriginalTask: (page: string, line: number, currentStatus: string, nextStatus: string) => void;
    qattUpdateOriginalTaskWithAppend: (page: string, line: number, currentStatus: string, nextStatus: string, append: string) => void;
    qattUpdateOriginalTaskWithDoneDate: (page: string, line: number, currentStatus: string, nextStatus: string) => void;
  }
}
