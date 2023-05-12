import { Plugin } from 'obsidian';
import { log, logging } from './lib/logging';
import { IQueryAllTheThingsPlugin } from 'IQueryAllTheThingsPlugin';
import { getSettings, updateSettings } from './Settings/Settings';
import { SettingsTab } from './Settings/SettingsTab';
import { QueryRenderer } from 'QueryRenderer';
import EventHandler from 'handlers/EventHandler';
import { CommandHandler } from 'handlers/CommandHandler';
import DataTables from 'DataTables';
import { container } from 'container';
import { TOKENS } from 'tokens';

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
    // public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;
    public event_handler: EventHandler | undefined;
    public command_handler: CommandHandler | undefined;

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

            DataTables.refreshTables("layout ready")
        });

        // refresh tables when dataview index is ready.
        this.registerEvent(this.app.metadataCache.on("dataview:index-ready", () => {
            DataTables.refreshTables("dataview index ready")
        }));

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('dice', 'Refresh QATT Tables', (evt: MouseEvent) => {
            DataTables.refreshTables("manual refresh")
        });

        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        this.command_handler = new CommandHandler(this);
        this.command_handler.setup();

        this.event_handler = new EventHandler(this);
        this.event_handler.setup();

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
