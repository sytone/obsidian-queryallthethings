import { PluginSettingTab, Setting, debounce, Plugin } from 'obsidian';
import { log } from './../lib/logging';
import { Feature } from './Feature';
import settingsJson from './settingsConfiguration.json';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { ISettingsManager } from 'Interfaces/ISettingsManager';


export class SettingsTab extends PluginSettingTab {
    // If the UI needs a more complex setting you can create a
    // custom function and specify it from the json file. It will
    // then be rendered instead of a normal checkbox or text box.
    customFunctions: { [K: string]: Function } = {
        insertFeatureFlags: this.insertFeatureFlags,
    };

    private plugin: IQueryAllTheThingsPlugin;
    private settingsManager: ISettingsManager;

    constructor(
        plugin: IQueryAllTheThingsPlugin,
        settingsManager: ISettingsManager
    ) {
        super(plugin.app, plugin as unknown as Plugin);
        this.plugin = plugin;
        this.settingsManager = settingsManager;
    }

    public async saveSettings(update?: boolean): Promise<void> {
        log('debug', `Saving settings with update: ${update}`);

        await this.plugin.saveSettings();

        if (update) {
            this.display();
        }
    }

    public display(): void {
        const { containerEl } = this;
        const { headingOpened } = this.settingsManager.getSettings();

        this.containerEl.empty();
        this.containerEl.addClass('qatt-settings');
        settingsJson.forEach((heading) => {
            const detailsContainer = containerEl.createEl('details', {
                cls: 'qatt-nested-settings',
                attr: {
                    ...(heading.open || headingOpened[heading.text] ? { open: true } : {}),
                },
            });
            detailsContainer.empty();
            detailsContainer.ontoggle = () => {
                headingOpened[heading.text] = detailsContainer.open;
                this.settingsManager.updateSettings({ headingOpened: headingOpened });
                this.plugin.saveSettings();
            };
            const summary = detailsContainer.createEl('summary');
            new Setting(summary).setHeading().setName(heading.text);
            summary.createDiv('collapser').createDiv('handle');

            // detailsContainer.createEl(heading.level as keyof HTMLElementTagNameMap, { text: heading.text });

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
            heading.settings.forEach((setting) => {
                if (setting.featureFlag !== '' && !this.settingsManager.isFeatureEnabled(setting.featureFlag)) {
                    // The settings configuration has a featureFlag set and the user has not
                    // enabled it. Skip adding the settings option.
                    return;
                }
                if (setting.type === 'checkbox') {
                    new Setting(detailsContainer)
                        .setName(setting.name)
                        .setDesc(setting.description)
                        .addToggle((toggle) => {
                            const settings = this.settingsManager.getSettings();
                            if (!settings.generalSettings[setting.settingName]) {
                                this.settingsManager.setValue(setting.settingName, setting.initialValue);
                            }
                            toggle
                                .setValue(<boolean>settings.generalSettings[setting.settingName])
                                .onChange(async (value) => {
                                    this.settingsManager.setValue(setting.settingName, value);
                                    await this.plugin.saveSettings();
                                });
                        });
                } else if (setting.type === 'text') {
                    new Setting(detailsContainer)
                        .setName(setting.name)
                        .setDesc(setting.description)
                        .addText((text) => {
                            const settings = this.settingsManager.getSettings();
                            if (!settings.generalSettings[setting.settingName]) {
                                this.settingsManager.setValue(setting.settingName, setting.initialValue);
                            }

                            const onChange = async (value: string) => {
                                this.settingsManager.setValue(setting.settingName, value);
                                await this.plugin.saveSettings();
                            };

                            text.setPlaceholder(setting.placeholder.toString())
                                .setValue(settings.generalSettings[setting.settingName].toString())
                                .onChange(debounce(onChange, 500, true));
                        });
                } else if (setting.type === 'textarea') {
                    new Setting(detailsContainer)
                        .setName(setting.name)
                        .setDesc(setting.description)
                        .addTextArea((text) => {
                            const settings = this.settingsManager.getSettings();
                            if (!settings.generalSettings[setting.settingName]) {
                                this.settingsManager.setValue(setting.settingName, setting.initialValue);
                            }

                            const onChange = async (value: string) => {
                                this.settingsManager.setValue(setting.settingName, value);
                                await this.plugin.saveSettings();
                            };

                            text.setPlaceholder(setting.placeholder.toString())
                                .setValue(settings.generalSettings[setting.settingName].toString())
                                .onChange(debounce(onChange, 500, true));

                            text.inputEl.rows = 8;
                            text.inputEl.cols = 40;
                        });
                } else if (setting.type === 'function') {
                    this.customFunctions[setting.settingName](detailsContainer, this);
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
            });
        });
    }

    /**
     * This renders the Features section of the settings tab. As it is more
     * complex it has a function specified from the json file.
     *
     * @param {HTMLElement} containerEl
     * @param {SettingsTab} settings
     * @memberof SettingsTab
     */
    insertFeatureFlags(containerEl: HTMLElement, settings: SettingsTab) {
        Feature.values.forEach((feature) => {
            new Setting(containerEl)
                .setName(feature.displayName)
                .setDesc(feature.description + ' Is Stable? ' + feature.stable)
                .addToggle((toggle) => {
                    toggle.setValue(settings.settingsManager.isFeatureEnabled(feature.internalName)).onChange(async (value) => {
                        const updatedFeatures = settings.settingsManager.toggleFeature(feature.internalName, value);
                        settings.settingsManager.updateSettings({ features: updatedFeatures });

                        await settings.saveSettings(true);
                    });
                });
        });
    }
}
