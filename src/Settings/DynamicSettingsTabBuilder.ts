/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import {SettingsService, useSettings, type Useful, getContext, onLoad, use} from '@ophidian/core';
import {type CachedMetadata, Notice, Plugin, type TFile, PluginSettingTab, type Component, Setting, htmlToMarkdown, debounce} from 'obsidian';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface SettingsProvider extends Component {
  showSettings?(builder: DynamicSettingsTabBuilder): void;
  hideSettings?(builder: DynamicSettingsTabBuilder): void;
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
    this.open = payload.open ?? true;
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
    this.textAreaCols = payload.textAreaCols ?? 40;
  }
}

export class DynamicSettingsTabBuilder extends PluginSettingTab implements Useful, FieldParent {
  plugin = use(Plugin);
  use = use.this;

  public cssClassPrefix = 'qatt';

  protected onDisplayCallback: (s: DynamicSettingsTabBuilder) => any;
  protected onHideCallback: (s: DynamicSettingsTabBuilder) => any;

  constructor() {
    super(app, use(Plugin));
    useSettings(this.plugin, null, undefined, () => {
      onLoad(this.plugin, () => {
        this.plugin.addSettingTab(this);
      });
    });
  }

  clear() {
    this.containerEl.empty();
    return this;
  }

  field(parentElement = this.containerEl): any {
    return new FieldBuilder(this, parentElement);
  }

  initializeTab() {
    this.containerEl.empty();
    this.containerEl.addClass('qatt-settings');
  }

  addHeading(heading: SettingsTabHeading) {
    const detailsContainer = this.containerEl.createEl('details', {
      cls: `${this.cssClassPrefix}-nested-settings`,
      attr: {
        ...(heading.open ? {open: true} : {}),
      },
    });
    detailsContainer.empty();
    detailsContainer.addEventListener('toggle', () => {
      // Save heading state.
      // headingOpened[heading.text] = detailsContainer.open;
      // this.settingsManager.updateSettings({headingOpened});
      // this.plugin.saveSettings();
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
        text.setPlaceholder(input.placeholder)
          .setValue(input.value)
          .onChange(debounce(onChange, 500, true));
      });
  }

  addTextAreaInput(input: SettingsTabField, onChange: (value: string) => void, parentElement = this.containerEl) {
    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addTextArea(text => {
        text.setPlaceholder(input.placeholder)
          .setValue(input.value)
          .onChange(debounce(onChange, 500, true));
        text.inputEl.rows = input.textAreaRows;
        text.inputEl.cols = input.textAreaCols;
      });
  }

  addDropdownInput(input: SettingsTabField, onChange: (value: string) => void, parentElement = this.containerEl) {
    const options = input.placeholder as Record<string, string>;

    return this.field(parentElement)
      .setName(input.name)
      .setDesc(input.description)
      .addDropdown(dropdown => {
        dropdown
          .addOptions(options)
          .setValue(input.value)
          .onChange(debounce(onChange, 500, true));
      });
  }

  /*
  AddField(field: SettingsTabField, parentContainer: HTMLElement) {
    switch (field.type) {
      case 'checkbox': {
      // --------------------------------------------------------------------------
      //                 Render options that are Boolean in nature.
      // --------------------------------------------------------------------------
        new Setting(parentContainer)
          .setName(field.name)
          .setDesc(field.description)
          .addToggle(toggle => {
            const settings = this.settingsManager.getSettings();
            if (!settings.generalSettings[setting.settingName]) {
              this.settingsManager.setValue(setting.settingName, setting.initialValue);
            }

            toggle
              .setValue(settings.generalSettings[setting.settingName] as boolean)
              .onChange(async value => {
                this.settingsManager.setValue(setting.settingName, value);
                await this.plugin.saveSettings();
              });
          });

        break;
      }

      case 'function': {
      // --------------------------------------------------------------------------
      //        If the UI is super custom then call the registered function.
      // --------------------------------------------------------------------------
        this.customFunctions[setting.settingName](detailsContainer, this);

        break;
      }
    // No default
    }
  }
*/
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
