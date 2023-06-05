
import {type Plugin, PluginSettingTab, Setting, debounce} from 'obsidian';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {type ISettingsManager} from 'Interfaces/ISettingsManager';
import {log} from 'lib/Logging';
import {Feature} from 'Settings/Feature';
import settingsJson from 'Settings/settingsConfiguration.json';

export class SettingsTab extends PluginSettingTab {
  // If the UI needs a more complex setting you can create a
  // custom function and specify it from the json file. It will
  // then be rendered instead of a normal checkbox or text box.
  // eslint-disable-next-line @typescript-eslint/ban-types
  customFunctions: Record<string, Function> = {
    insertFeatureFlags: this.insertFeatureFlags,
  };

  /**
     * Creates the setting tab to display in the Obsidian setting. The
     * settings are driven by JSON based configuration to make maintenance
     * simpler.
     * @param {IQueryAllTheThingsPlugin} plugin
     * @param {ISettingsManager} settingsManager
     * @memberof SettingsTab
     */
  constructor(
    private readonly plugin: IQueryAllTheThingsPlugin,
    private readonly settingsManager: ISettingsManager,
  ) {
    super(plugin.app, plugin as unknown as Plugin);
  }

  /**
     * Request the plugin to save setting to the data file.
     *
     * @param {boolean} [update]
     * @return {*}  {Promise<void>}
     * @memberof SettingsTab
     */
  public async saveSettings(update = false): Promise<void> {
    log('debug', `Saving settings with update: ${update ? 'true' : 'false'}`);

    await this.plugin.saveSettings();

    if (update) {
      this.display();
    }
  }

  /**
     * Render the setting tab using the JSON configuration.
     *
     * @memberof SettingsTab
     */
  public display(): void {
    const {containerEl} = this;
    const {headingOpened} = this.settingsManager.getSettings();

    this.containerEl.empty();
    this.containerEl.addClass('qatt-settings');

    for (const heading of settingsJson) {
      const detailsContainer = containerEl.createEl('details', {
        cls: 'qatt-nested-settings',
        attr: {
          ...(heading.open || headingOpened[heading.text] ? {open: true} : {}),
        },
      });
      detailsContainer.empty();
      detailsContainer.addEventListener('toggle', () => {
        headingOpened[heading.text] = detailsContainer.open;
        this.settingsManager.updateSettings({headingOpened});
        this.plugin.saveSettings();
      });

      const summary = detailsContainer.createEl('summary');
      new Setting(summary).setHeading().setName(heading.text);
      summary.createDiv('collapser').createDiv('handle');

      // DetailsContainer.createEl(heading.level as keyof HTMLElementTagNameMap, { text: heading.text });

      if (heading.notice !== null) {
        const notice = detailsContainer.createEl('div', {
          cls: heading.notice.class,
          text: heading.notice.text,
        });
        if (heading.notice.html !== null) {
          notice.insertAdjacentHTML('beforeend', heading.notice.html);
        }
      }

      // This will process all the settings from settingsConfiguration.json and render
      // them out reducing the duplication of the code in this file. This will become
      // more important as features are being added over time.
      for (const setting of heading.settings) {
        if (setting.featureFlag !== '' && !this.settingsManager.isFeatureEnabled(setting.featureFlag)) {
          // The settings configuration has a featureFlag set and the user has not
          // enabled it. Skip adding the settings option.
          continue;
        }

        switch (setting.type) {
          case 'checkbox': {
          /* -------------------------------------------------------------------------- */
          /*                 Render options that are Boolean in nature.                 */
          /* -------------------------------------------------------------------------- */
            new Setting(detailsContainer)
              .setName(setting.name)
              .setDesc(setting.description)
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

          case 'text': {
          /* -------------------------------------------------------------------------- */
          /*                Render options that are single lines of text.               */
          /* -------------------------------------------------------------------------- */
            new Setting(detailsContainer)
              .setName(setting.name)
              .setDesc(setting.description)
              .addText(text => {
                const settings = this.settingsManager.getSettings();
                if (!settings.generalSettings[setting.settingName]) {
                  this.settingsManager.setValue(setting.settingName, setting.initialValue);
                }

                const onChange = async (value: string) => {
                  this.settingsManager.setValue(setting.settingName, value);
                  await this.plugin.saveSettings();
                };

                text.setPlaceholder(setting.placeholder as string)
                  .setValue(settings.generalSettings[setting.settingName] as string)
                  .onChange(debounce(onChange, 500, true));
              });

            break;
          }

          case 'textarea': {
          /* -------------------------------------------------------------------------- */
          /*               Render options that are multiple lines of text.              */
          /* -------------------------------------------------------------------------- */
            new Setting(detailsContainer)
              .setName(setting.name)
              .setDesc(setting.description)
              .addTextArea(text => {
                const settings = this.settingsManager.getSettings();
                if (!settings.generalSettings[setting.settingName]) {
                  this.settingsManager.setValue(setting.settingName, setting.initialValue);
                }

                const onChange = async (value: string) => {
                  this.settingsManager.setValue(setting.settingName, value);
                  await this.plugin.saveSettings();
                };

                text.setPlaceholder(setting.placeholder as string)
                  .setValue(settings.generalSettings[setting.settingName] as string)
                  .onChange(debounce(onChange, 500, true));

                text.inputEl.rows = 8;
                text.inputEl.cols = 40;
              });

            break;
          }

          case 'dropdown': {
            // -------------------------------------------------------------------------- //
            //               Render options that are selectable from a drop down.         //
            // -------------------------------------------------------------------------- //
            /*
              The setting.placeholder value is used to define the options for the dropdown. It is a record of key value pairs. The key is the value that is stored in the settings file and the value is the text that is displayed to the user. For example: { '1': 'One', '2': 'Two' } will display the options 'One' and 'Two' to the user and store the value '1' or '2' in the settings file. This is useful for when the value stored in the settings file is not the same as the value displayed to the user.
            */

            const options = setting.placeholder as Record<string, string>;

            new Setting(detailsContainer)
              .setName(setting.name)
              .setDesc(setting.description)
              .addDropdown(dropdown => {
                const settings = this.settingsManager.getSettings();
                if (!settings.generalSettings[setting.settingName]) {
                  this.settingsManager.setValue(setting.settingName, setting.initialValue);
                }

                const onChange = async (value: string) => {
                  this.settingsManager.setValue(setting.settingName, value);
                  await this.plugin.saveSettings();
                };

                dropdown
                  .addOptions(options)
                  .setValue(settings.generalSettings[setting.settingName].toString())
                  .onChange(debounce(onChange, 500, true));
              });

            break;
          }

          case 'function': {
          /* -------------------------------------------------------------------------- */
          /*        If the UI is super custom then call the registered function.        */
          /* -------------------------------------------------------------------------- */
            this.customFunctions[setting.settingName](detailsContainer, this);

            break;
          }
        // No default
        }

        if (setting.notice !== null) {
          const notice = detailsContainer.createEl('p', {
            cls: setting.notice.class,
            text: setting.notice.text,
          });
          if (setting.notice.html !== null) {
            notice.insertAdjacentHTML('beforeend', setting.notice.html);
          }
        }
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                  Below here place the customer functions.                  */
  /* -------------------------------------------------------------------------- */

  /**
     * This renders the Features section of the settings tab. As it is more
     * complex it has a function specified from the json file.
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
     * @memberof SettingsTab
     */
  insertFeatureFlags(containerElement: HTMLElement, settings: SettingsTab) {
    for (const feature of Feature.values) {
      new Setting(containerElement)
        .setName(feature.displayName)
        .setDesc(`${feature.description} Is Stable? ${feature.stable ? 'Yes' : 'No'}`)
        .addToggle(toggle => {
          toggle.setValue(settings.settingsManager.isFeatureEnabled(feature.internalName)).onChange(async value => {
            const updatedFeatures = settings.settingsManager.toggleFeature(feature.internalName, value);
            settings.settingsManager.updateSettings({features: updatedFeatures});

            await settings.saveSettings(true);
          });
        });
    }
  }
}
