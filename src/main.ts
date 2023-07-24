/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Notice, Plugin} from 'obsidian';
import {use, useSettings} from '@ophidian/core';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {QueryRendererService} from 'QueryRenderer';
import EventHandler from 'handlers/EventHandler';
import {CommandHandler} from 'handlers/CommandHandler';
import {DataTables} from 'Data/DataTables';
import {isPluginEnabled} from 'obsidian-dataview';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {SettingsTab} from 'Settings/SettingsTab';
import {SettingsManager} from 'Settings/SettingsManager';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {HandlebarsRendererObsidian} from 'Render/HandlebarsRendererObsidian';
import {DefaultSettings} from 'Settings/DefaultSettings';
import {LoggingService} from 'lib/LoggingService';
import {QueryFactory} from 'Query/QueryFactory';

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  use = use.plugin(this);
  logger = this.use(LoggingService);

  settings = useSettings(
    this, // Plugin or other owner
    DefaultSettings, // Default settings
    (settings: typeof DefaultSettings) => {
      // Code to init or update plugin state from settings
      this.logger.configure(settings.loggingOptions);
    },
  );

  // Public inlineRenderer: InlineRenderer | undefined;
  public queryRendererService: QueryRendererService | undefined;
  public eventHandler: EventHandler | undefined;
  public commandHandler: CommandHandler | undefined;
  public settingsManager: SettingsManager | undefined;
  public dataTables: DataTables | undefined;

  onload() {
    // This.use.set(QueryFactory, new QueryFactory());
    this.use(QueryFactory).load();

    // Setup logging and settings.
    this.logger.info(`loading plugin "${this.manifest.name}" v${this.manifest.version}`);

    // --- Settings
    // Load up the settings manager.
    this.settingsManager = new SettingsManager();

    // Wire up events from the settings.
    this.settingsManager.on('settings-updated', async () => {
      await this.saveSettings();
    });

    // Await this.loadSettings();
    const {generalSettings, loggingOptions} = this.settingsManager.getSettings();

    // Setup the UI tab.
    this.addSettingTab(new SettingsTab(this, this.settingsManager));

    this.dataTables = new DataTables(this);

    if (!isPluginEnabled(this.app)) {
      // eslint-disable-next-line no-new
      new Notice('Dataview plugin is not installed. Please install it to load Databases.');
      throw new Error('Dataview plugin is not installed');
    }

    HandlebarsRenderer.registerHandlebarsHelpers();
    HandlebarsRendererObsidian.registerHandlebarsHelpers();
    AlaSqlQuery.initialize();

    // When layout is ready we can refresh tables and register the query renderer.
    this.app.workspace.onLayoutReady(async () => {
      this.logger.info(`Layout is ready for workspace: ${this.app.vault.getName()}`);
      this.logger.info('-- General Settings --');

      for (const key of Object.keys(generalSettings)) {
        const value = generalSettings[key] as string;
        this.logger.info(`${key}: ${value}`);
      }

      this.dataTables?.refreshTables('layout ready');

      // Load any custom queries from configuration.
      const onStartSqlQueries = this.settingsManager?.getValue('onStartSqlQueries') as string;
      if (onStartSqlQueries) {
        this.dataTables?.runAdhocQuery(onStartSqlQueries);
      }

      (window as any).qattUpdateOriginalTask = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
        nextStatus = nextStatus === '' ? ' ' : nextStatus;

        const rawFileText = await this.app.vault.adapter.read(page);
        const hasRN = rawFileText.contains('\r');
        const fileText = rawFileText.split(/\r?\n/u);

        if (fileText.length < line) {
          return;
        }

        fileText[line] = fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`);

        const newText = fileText.join(hasRN ? '\r\n' : '\n');
        await this.app.vault.adapter.write(page, newText);
        app.workspace.trigger('dataview:refresh-views');
      };

      this.queryRendererService = this.use(QueryRendererService);
    });

    // Refresh tables when dataview index is ready.
    this.registerEvent(this.app.metadataCache.on('dataview:index-ready', () => {
      this.logger.info('dataview:index-ready event detected.');
      this.dataTables?.refreshTables('dataview:index-ready event detected');
    }));

    this.registerEvent(this.app.workspace.on('dataview:refresh-views', () => {
      this.logger.info('dataview:refresh-views event detected.');
      this.dataTables?.refreshTables('dataview:refresh-views event detected');
    }));

    // Allow user to refresh the tables manually.
    this.addRibbonIcon('refresh-cw', 'Refresh QATT Tables', (evt: MouseEvent) => {
      this.logger.info(`Refresh QATT Tables: ${evt.button}`);
      this.dataTables?.refreshTables('manual refresh');
    });

    // Update with render data if debug mode is enable
    // future planned work. Does not work on mobile apps.
    // const statusBarItemElement = this.addStatusBarItem();
    // statusBarItemElement.setText('Status Bar Text');

    this.commandHandler = new CommandHandler(this, this.settingsManager);
    this.commandHandler.setup();

    this.eventHandler = new EventHandler(this, this.settingsManager);
    this.eventHandler.setup();
  }

  onunload() {
    this.logger.info(`unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  async loadSettings() {
    const newSettings = await this.loadData();
    this.settingsManager?.updateSettings(newSettings);
  }

  async saveSettings() {
    await this.saveData(this.settingsManager?.getSettings());
  }
}
