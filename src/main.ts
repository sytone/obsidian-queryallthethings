import { Plugin } from 'obsidian';
import { log, logging } from './lib/logging';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { SettingsManager } from './Settings/SettingsManager';
import { SettingsTab } from './Settings/SettingsTab';
import { QueryRenderer } from 'QueryRenderer';
import EventHandler from 'handlers/EventHandler';
import { CommandHandler } from 'handlers/CommandHandler';
import { DataTables } from 'DataTables';

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
    // public inlineRenderer: InlineRenderer | undefined;
    public queryRenderer: QueryRenderer | undefined;
    public event_handler: EventHandler | undefined;
    public command_handler: CommandHandler | undefined;
    public settingsManager: SettingsManager | undefined;
    public dataTables: DataTables | undefined;

    async onload(): Promise<void> {

        // Setup logging and settings.
        logging.registerConsoleLogger();
        log('info', `loading plugin "${this.manifest.name}" v${this.manifest.version}`);

        // Load up the settings manager.
        this.settingsManager = new SettingsManager(this);
        await this.loadSettings();
        const { loggingOptions } = this.settingsManager.getSettings();
        // Configure logging.
        logging.configure(loggingOptions);

        // Setup the UI tab.
        this.addSettingTab(new SettingsTab(this, this.settingsManager));
        this.dataTables = new DataTables(this);

        // When layout is ready we can refresh tables and register the query renderer.
        this.app.workspace.onLayoutReady(async () => {
            log('info', `Layout is ready for workspace: ${this.app.vault.getName()}`);

            // this.inlineRenderer = new InlineRenderer({ plugin: this });
            this.queryRenderer = new QueryRenderer({ plugin: this });

            this.dataTables?.refreshTables("layout ready")
        });

        // refresh tables when dataview index is ready.
        this.registerEvent(this.app.metadataCache.on("dataview:index-ready", () => {
            this.dataTables?.refreshTables("dataview index ready")
        }));

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('dice', 'Refresh QATT Tables', (evt: MouseEvent) => {
            this.dataTables?.refreshTables("manual refresh")
        });

        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        this.command_handler = new CommandHandler(this, this.settingsManager);
        this.command_handler.setup();

        this.event_handler = new EventHandler(this, this.settingsManager);
        this.event_handler.setup();

    }

    onunload() {
        log('info', `unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
    }

    async loadSettings() {
        const newSettings = await this.loadData();
        this.settingsManager?.updateSettings(newSettings);
    }

    async saveSettings() {
        await this.saveData(this.settingsManager?.getSettings());
    }
}
