import { Notice, Plugin } from 'obsidian';
import { IQueryAllTheThingsPlugin } from 'Interfaces/IQueryAllTheThingsPlugin';
import { QueryRenderer } from 'QueryRenderer';
import EventHandler from 'handlers/EventHandler';
import { CommandHandler } from 'handlers/CommandHandler';
import { DataTables } from 'DataTables';
import { SettingsTab } from './Settings/SettingsTab';
import { SettingsManager } from './Settings/SettingsManager';
import { log, logging } from './lib/logging';

import { isPluginEnabled } from "obsidian-dataview";


export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  // public inlineRenderer: InlineRenderer | undefined;
  public queryRenderer: QueryRenderer | undefined;
  public eventHandler: EventHandler | undefined;
  public commandHandler: CommandHandler | undefined;
  public settingsManager: SettingsManager | undefined;
  public dataTables: DataTables | undefined;

  async onload (): Promise<void> {
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

    if (!isPluginEnabled(app)) {
      new Notice(`Dataview plugin is not installed. Please install it to load Databases.`);
      throw new Error('Dataview plugin is not installed');
    }

    // When layout is ready we can refresh tables and register the query renderer.
    this.app.workspace.onLayoutReady(async () => {
      log('info', `Layout is ready for workspace: ${this.app.vault.getName()}`);

      // this.inlineRenderer = new InlineRenderer({ plugin: this });
      this.queryRenderer = new QueryRenderer(this);

      this.dataTables?.refreshTables('layout ready');
    });

    // refresh tables when dataview index is ready.
    this.registerEvent(this.app.metadataCache.on('dataview:index-ready', () => {
      log('info', 'dataview:index-ready event detected.');
      this.dataTables?.refreshTables('dataview:index-ready event detected');
    }));

    this.registerEvent(this.app.workspace.on('dataview:refresh-views', () => {
      log('info', 'dataview:refresh-views event detected.');
      this.dataTables?.refreshTables('dataview:refresh-views event detected');
    }));

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('dice', 'Refresh QATT Tables', (evt: MouseEvent) => {
      log('info', `Refresh QATT Tables: ${evt.button}`);
      this.dataTables?.refreshTables('manual refresh');
    });

    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    this.commandHandler = new CommandHandler(this, this.settingsManager);
    this.commandHandler.setup();

    this.eventHandler = new EventHandler(this, this.settingsManager);
    this.eventHandler.setup();
  }

  onunload () {
    log('info', `unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  async loadSettings () {
    const newSettings = await this.loadData();
    this.settingsManager?.updateSettings(newSettings);
  }

  async saveSettings () {
    await this.saveData(this.settingsManager?.getSettings());
  }
}
