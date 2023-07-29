/* eslint-disable unicorn/filename-case */

import {type CachedMetadata, Notice, Plugin, type TFile} from 'obsidian';
import {use} from '@ophidian/core';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import type EventHandler from 'handlers/EventHandler';
import {type CommandHandler} from 'handlers/CommandHandler';
import {DataTables} from 'Data/DataTables';
import {isPluginEnabled} from 'obsidian-dataview';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {type SettingsManager} from 'Settings/SettingsManager';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {HandlebarsRendererObsidian} from 'Render/HandlebarsRendererObsidian';
import {LoggingService} from 'lib/LoggingService';
import {QueryFactory} from 'Query/QueryFactory';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryRendererV2Service} from 'QueryRendererV2';
import {NotesCacheService} from 'NotesCacheService';

export class Note {
  constructor(public markdownFile: TFile, public metadata: CachedMetadata | undefined) {}
}

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  use = use.plugin(this);
  logger = this.use(LoggingService).getLogger('Qatt');
  dataTables = this.use(DataTables);

  // Public inlineRenderer: InlineRenderer | undefined;
  public queryRendererService: QueryRendererV2Service | undefined;
  public eventHandler: EventHandler | undefined;
  public commandHandler: CommandHandler | undefined;
  public settingsManager: SettingsManager | undefined;
  public notesCacheService: NotesCacheService | undefined;

  onload() {
    this.logger.info(`loading plugin "${this.manifest.name}" v${this.manifest.version}`);

    // Load the query factory in the main context for all services to use.
    this.use(QueryFactory).load();

    // Load the Render factory in the main context for all services to use.
    this.use(RenderFactory).load();
    this.use(AlaSqlQuery).load();

    // --- Settings
    // Load up the settings manager.
    // this.settingsManager = new SettingsManager();

    // Wire up events from the settings.
    // this.settingsManager.on('settings-updated', async () => {
    //   await this.saveSettings();
    // });

    // Await this.loadSettings();
    // const {generalSettings, loggingOptions} = this.settingsManager.getSettings();

    // Setup the UI tab.
    // this.addSettingTab(new SettingsTab(this, this.settingsManager));

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

      this.dataTables?.refreshTables('layout ready');

      // Load any custom queries from configuration.
      // const onStartSqlQueries = this.settingsManager?.getValue('onStartSqlQueries') as string;
      // if (onStartSqlQueries) {
      //   this.dataTables?.runAdhocQuery(onStartSqlQueries);
      // }

      (window as any).qattUpdateOriginalTask = async function (page: string, line: number, currentStatus: string, nextStatus: string) {
        nextStatus = nextStatus === '' ? ' ' : nextStatus;

        const rawFileText = await app.vault.adapter.read(page);
        const hasRN = rawFileText.contains('\r');
        const fileText = rawFileText.split(/\r?\n/u);

        if (fileText.length < line) {
          return;
        }

        fileText[line] = fileText[line].replace(`[${currentStatus}]`, `[${nextStatus}]`);

        const newText = fileText.join(hasRN ? '\r\n' : '\n');
        await app.vault.adapter.write(page, newText);
        app.workspace.trigger('dataview:refresh-views');
      };

      // D this.queryRendererService = this.use(QueryRendererService);
      this.queryRendererService = this.use(QueryRendererV2Service);

      this.notesCacheService = this.use(NotesCacheService);
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

    // this.commandHandler = new CommandHandler(this, this.settingsManager);
    // this.commandHandler.setup();

    // this.eventHandler = new EventHandler(this, this.settingsManager);
    // this.eventHandler.setup();
  }

  onunload() {
    this.logger.info(`unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  // Old settings
  // async loadSettings() {
  //   const newSettings = await this.loadData();
  //   this.settingsManager?.updateSettings(newSettings);
  // }

  // async saveSettings() {
  //   await this.saveData(this.settingsManager?.getSettings());
  // }
}
