
import {SettingsService, type Useful, getContext, onLoad, use} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {Plugin, PluginSettingTab, Component, Setting, debounce} from 'obsidian';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface SettingsProvider extends Component {
  showSettings?(component: Component): void;
}

export function useSettingsTab<T>(owner: SettingsProvider & Partial<Useful>) {
  return getContext(owner)(DynamicSettingsTabBuilder).addProvider(owner);
}

export class SettingsTabHeading {
  text: string;
  level: string;
  class: string;
  open: boolean;
  noticeClass: string;
  noticeText: string;
  noticeHtml: string;

  constructor(payload: Partial<SettingsTabHeading>) {
    this.text = payload.text ?? '';
    this.level = payload.level ?? '';
    this.class = payload.class ?? '';
    this.open = payload.open ?? false;
    this.noticeClass = payload.noticeClass ?? '';
    this.noticeText = payload.noticeText ?? '';
    this.noticeHtml = payload.noticeHtml ?? '';
  }
}

export class SettingsTabField {
  name: string;
  description: string;
  type: string;
  value: string | Record<string, string> | boolean | number;
  placeholder: string | Record<string, string> | boolean | number;
  settingName: string;
  featureFlag: string;
  noticeClass: string;
  noticeText: string;
  noticeHtml: string;
  textAreaRows: number;
  textAreaCols: number;

  constructor(payload: Partial<SettingsTabField>) {
    this.name = payload.name ?? '';
    this.description = payload.description ?? '';
    this.type = payload.type ?? '';
    this.value = payload.value ?? '';
    this.placeholder = payload.placeholder ?? '';
    this.settingName = payload.settingName ?? '';
    this.featureFlag = payload.featureFlag ?? '';

    this.noticeClass = payload.noticeClass ?? '';
    this.noticeText = payload.noticeText ?? '';
    this.noticeHtml = payload.noticeHtml ?? '';
    this.textAreaRows = payload.textAreaRows ?? 8;
    this.textAreaCols = payload.textAreaCols ?? 60;
  }
}

export class DynamicSettingsTabBuilder extends PluginSettingTab implements Useful, FieldParent {
  plugin = use(Plugin);
  use = use.this;
  logger = this.use(LoggingService).getLogger('DynamicSettingsTabBuilder');

  component: Component;

  public cssClassPrefix = 'qatt';

  protected onDisplayCallback?: (s: Component) => any;

  constructor() {
    super(app, use(Plugin));
    this.plugin.register(use(SettingsService).once(() => {
      onLoad(this.plugin, () => {
        this.plugin.addSettingTab(this);
        this.logger.debug('addSettingTab', this);
      });
    }));
  }

  clear() {
    this.containerEl.empty();
    return this;
  }

  field(parentElement = this.containerEl): FieldBuilder<this> {
    return new FieldBuilder(this, parentElement);
  }

  initializeTab() {
    this.containerEl.empty();
    this.containerEl.addClass('qatt-settings');
  }

  addHeading(heading: SettingsTabHeading, onToggle: (value: boolean) => void) {
    const detailsContainer = this.containerEl.createEl('details', {
      cls: `${this.cssClassPrefix}-nested-settings`,
      attr: {
        ...(heading.open ? {open: true} : {}),
      },
    });
    detailsContainer.empty();
    detailsContainer.addEventListener('toggle', () => {
      onToggle(detailsContainer.open);
    });

    const summary = detailsContainer.createEl('summary');
    new Setting(summary).setHeading().setName(heading.text);
    summary.createDiv('collapser').createDiv('handle');

    // DetailsContainer.createEl(heading.level as keyof HTMLElementTagNameMap, { text: heading.text });

    if (heading.noticeText !== null) {
      const notice = detailsContainer.createEl('div', {
        cls: heading.noticeClass,
        text: heading.noticeText,
      });
      if (heading.noticeHtml) {
        notice.insertAdjacentHTML('beforeend', heading.noticeHtml);
      }
    }

    return detailsContainer;
  }

  addTextInput(input: SettingsTabField, onChange: (value: string) => void, parentElement = this.containerEl) {
    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addText(text => {
        text.setPlaceholder(input.placeholder as string)
          .setValue(input.value as string)
          .onChange(debounce(onChange, 500, true));
      });
  }

  addTextAreaInput(input: SettingsTabField, onChange: (value: string) => void, parentElement = this.containerEl) {
    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addTextArea(text => {
        text.setPlaceholder(input.placeholder as string)
          .setValue(input.value as string)
          .onChange(debounce(onChange, 500, true));
        text.inputEl.rows = input.textAreaRows;
        text.inputEl.cols = input.textAreaCols;
      });
  }

  addDropdownInput(input: SettingsTabField, onChange: (value: string | number) => void, parentElement = this.containerEl) {
    const options = input.placeholder as Record<string, string>;

    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addDropdown(dropdown => {
        dropdown
          .addOptions(options)
          .setValue(input.value as string)
          .onChange(debounce(onChange, 500, true));
      });
  }

  addToggle(input: SettingsTabField, onChange: (value: boolean) => void, parentElement = this.containerEl) {
    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addToggle(toggle => {
        toggle.setValue(input.value as boolean)
          .onChange(debounce(onChange, 500, true));
      });
  }

  // eslint-disable-next-line unicorn/no-thenable
  then(cb: (s: this) => any): this {
    cb(this);
    return this;
  }

  addProvider(provider: SettingsProvider) {
    if (provider.showSettings) {
      this.onDisplay(c => {
        if (provider._loaded && provider.showSettings) {
          provider.showSettings(c);
        }
      });
    }

    return this;
  }

  onDisplay(cb?: (s: Component) => any) {
    this.onDisplayCallback = chain(this.onDisplayCallback, cb);
  }

  display() {
    this.component = new Component();
    this.component.load();
    this.onDisplayCallback?.(this.component);
  }

  hide() {
    this.component.unload();
    this.clear();
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
