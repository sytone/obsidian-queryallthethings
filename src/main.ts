import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { log, logging } from './lib/logging';
import { IQueryAllTheThingsPlugin } from 'IQueryAllTheThingsPlugin';
import { getSettings, updateSettings } from './Settings/Settings';
import { SettingsTab } from './Settings/SettingsTab';
import { QueryRenderer } from 'QueryRenderer';
import alasql from 'alasql';
import { getAPI } from "obsidian-dataview";
import moment from 'moment';
import { DateTime } from "luxon";
import { parseTask } from 'Parse/parsers';

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
    // public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;

    async onload(): Promise<void> {

        // Setup logging.
        logging.registerConsoleLogger();
        log('info', `loading plugin "${this.manifest.name}" v${this.manifest.version}`);

        await this.loadSettings();
        const { loggingOptions } = getSettings();

        // Configure logging.
        logging.configure(loggingOptions);

        // Setup the UI tab.
        this.addSettingTab(new SettingsTab({ plugin: this }));

        this.app.workspace.onLayoutReady(async () => {
            log('info', `Layout is ready for workspace: ${this.app.vault.getName()}`);

            // this.inlineRenderer = new InlineRenderer({ plugin: this });
            this.queryRenderer = new QueryRenderer({ plugin: this });

            this.refreshTables()
        });

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('dice', 'Refresh QATT Tables', (evt: MouseEvent) => {
            this.refreshTables()
        });
        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-sample-modal-simple',
            name: 'Open sample modal (simple)',
            callback: () => {
                new SampleModal(this.app).open();
            }
        });
        // This adds an editor command that can perform some operation on the current editor instance
        this.addCommand({
            id: 'sample-editor-command',
            name: 'Sample editor command',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                console.log(editor.getSelection());
                editor.replaceSelection('Sample Editor Command');
            }
        });
        // This adds a complex command that can check whether the current state of the app allows execution of the command
        this.addCommand({
            id: 'open-sample-modal-complex',
            name: 'Open sample modal (complex)',
            checkCallback: (checking: boolean) => {
                // Conditions to check
                const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (markdownView) {
                    // If checking is true, we're simply "checking" if the command can be run.
                    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        new SampleModal(this.app).open();
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true;
                }
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        //this.addSettingTab(new SampleSettingTab(this.app, this));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
        //     console.log('click', evt);
        // });

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
    }

    refreshTables() {
        if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
            alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        }
        if (alasql('SHOW TABLES FROM alasql LIKE "tasks"').length != 0) {
            alasql('DROP TABLE tasks ');

        }
        alasql('CREATE TABLE tasks ');

        let start = moment();
        // Todo force a update on page changes.
        //      tag: _ => parsimmon_umd_min.exports.seqMap(parsimmon_umd_min.exports.string("#"), parsimmon_umd_min.exports.alt(parsimmon_umd_min.exports.regexp(/[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]/).desc("text")).many(), (start, rest) => start + rest.join("")).desc("tag ('#hello/stuff')"),
        // /[^\u2000-\u206F\u2E00-\u2E7F'!"#$%&()*+,.:;<=>?@^`{|}~\[\]\\\s]/
        getAPI(this.app)?.index.pages.forEach(p => {
            p.lists.forEach(l => {
                if (l.task) {
                    let parsedTask = parseTask(l.text);
                    alasql('INSERT INTO tasks VALUES ?', [{
                        page: p.path,
                        task: l.text,
                        status: l.task?.status,
                        tags: parsedTask.tags,
                        tagsNormalized: parsedTask.tagsNormalized,
                        dueDate: parsedTask.dueDate,
                        doneDate: parsedTask.doneDate,
                        startDate: parsedTask.startDate,
                        createDate: parsedTask.createDate,
                        scheduledDate: parsedTask.scheduledDate,
                        priority: parsedTask.priority
                    }]);
                }
            });
        });
        log('info', `Tasks refreshed in ${moment().diff(start, 'millisecond').toString()}ms`);
    }

    onunload() {
        log('info', `unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
    }

    async loadSettings() {
        const newSettings = await this.loadData();
        updateSettings(newSettings);
    }

    async saveSettings() {
        await this.saveData(getSettings());
    }
}

class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Woah!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


