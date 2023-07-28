import {type Useful, getContext, onLoad, use} from '@ophidian/core';
import {type CachedMetadata, Notice, Plugin, type TFile, PluginSettingTab, type Component, Setting} from 'obsidian';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface SettingsProvider extends Component {
  showSettings?(builder: DynamicSettingsTabBuilder): void;
  hideSettings?(builder: DynamicSettingsTabBuilder): void;
}

export function useSettingsTab(owner: SettingsProvider & Partial<Useful>) {
  return getContext(owner)(DynamicSettingsTabBuilder).addProvider(owner);
}

export class DynamicSettingsTabBuilder extends PluginSettingTab implements FieldParent {
  protected onDisplayCallback: (s: DynamicSettingsTabBuilder) => any;
  protected onHideCallback: (s: DynamicSettingsTabBuilder) => any;

  constructor() {
    const plugin = use(Plugin);
    super(app, plugin);
    onLoad(plugin, () => {
      plugin.addSettingTab(this);
    });
  }

  clear() {
    this.containerEl.empty();
    return this;
  }

  field(parentElement = this.containerEl): any {
    return new FieldBuilder(this, parentElement);
  }

  // eslint-disable-next-line unicorn/no-thenable
  then(cb: (s: this) => any): this {
    cb(this);
    return this;
  }

  addProvider(provider: SettingsProvider) {
    if (provider.showSettings) {
      this.onDisplay(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        provider._loaded && provider.showSettings?.(this);
      });
    }

    if (provider.hideSettings) {
      this.onHide(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        provider._loaded && provider.hideSettings?.(this);
      });
    }

    return this;
  }

  onDisplay(cb: (s: DynamicSettingsTabBuilder) => any) {
    this.onDisplayCallback = chain(this.onDisplayCallback, cb);
  }

  onHide(cb: (s: DynamicSettingsTabBuilder) => any) {
    this.onHideCallback = chain(cb, this.onHideCallback);
  }

  display() {
    this.onDisplayCallback?.(this);
  }

  hide() {
    if (this.onHideCallback) {
      this.onHideCallback?.(this);
    } else {
      this.clear();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface FieldParent {
  containerEl: HTMLElement;
  field(parentElement?: HTMLElement): FieldBuilder<this>;
}

export class FieldBuilder<T extends FieldParent> extends Setting {
  constructor(public builder: T, parentElement = builder.containerEl) {
    super(parentElement);
  }

  end() {
    return this.builder;
  }

  field(parentElement?: HTMLElement): FieldBuilder<T> {
    return this.builder.field(parentElement);
  }
}

function chain<T>(f1: (v: T) => any, f2: (v: T) => any): (v: T) => void {
  if (!f1) {
    return f2;
  }

  if (!f2) {
    return f1;
  }

  return v => {
    f1?.(v);
    f2?.(v);
  };
}
