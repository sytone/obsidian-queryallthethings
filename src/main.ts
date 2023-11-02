/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type CachedMetadata, Notice, Plugin, type TFile} from 'obsidian';
import {use, useSettings} from '@ophidian/core';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import type EventHandler from 'handlers/EventHandler';
import {type CommandHandler} from 'handlers/CommandHandler';
import {DataTables} from 'Data/DataTables';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {type SettingsManager} from 'Settings/SettingsManager';
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {HandlebarsRendererObsidian} from 'Render/HandlebarsRendererObsidian';
import {LoggingService} from 'lib/LoggingService';
import {QueryFactory} from 'Query/QueryFactory';
import {RenderFactory} from 'Render/RenderFactory';
import {QueryRendererV2Service} from 'QueryRendererV2';
import {NotesCacheService} from 'NotesCacheService';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {CsvLoaderService} from 'Data/CsvLoaderService';
import {MarkdownTableLoaderService} from 'Data/MarkdownTableLoaderService';
import {JsonLoaderService} from 'Data/JsonLoaderService';
import {DataviewService} from 'Integrations/DataviewService';
import {SqlLoaderService} from 'Data/SqlLoaderService';
import {UpdateModal} from 'lib/UpdateModal';
import {confirmObjectPath, promptWithSuggestions} from 'Internal';

export class Note {
  constructor(public markdownFile: TFile, public metadata: CachedMetadata | undefined) {}
}

export interface IGeneralSettings {
  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen: boolean;
  generalHeadingOpen: boolean;

}

export const GeneralSettingsDefaults: IGeneralSettings = {
  onStartSqlQueries: 'CREATE TABLE my_lookup(name,birthday);\nINSERT INTO my_lookup VALUES ("fred", 2000-02-03);',
  announceUpdates: true,
  version: '',
  mainHeadingOpen: true,
  generalHeadingOpen: false,
};

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  use = use.plugin(this);
  logger = this.use(LoggingService).getLogger('Qatt');
  dataTables = this.use(DataTables);

  // Settings, TBD is I use this or not.
  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    GeneralSettingsDefaults,
    (settings: IGeneralSettings) => {
      // This will run every time the settings are updated.
      this.logger.info('Settings Updated', settings);
      this.onStartSqlQueries = settings.onStartSqlQueries;
      this.announceUpdates = settings.announceUpdates;
      this.version = settings.version;
      this.mainHeadingOpen = settings.mainHeadingOpen;
      this.generalHeadingOpen = settings.generalHeadingOpen;
    },
    (settings: IGeneralSettings) => {
      // This will run when the settings are first loaded.
      this.logger.info('Settings Initialize', settings);
      this.onStartSqlQueries = settings.onStartSqlQueries;
      this.announceUpdates = settings.announceUpdates;
      this.version = settings.version;
      this.mainHeadingOpen = settings.mainHeadingOpen;
      this.generalHeadingOpen = settings.generalHeadingOpen;
      if (this.onStartSqlQueries) {
        this.logger.info('Running on start SQL queries', this.onStartSqlQueries);
        const onStartResult = this.dataTables?.runAdhocQuery(this.onStartSqlQueries);
        this.logger.info('On start SQL queries result', onStartResult);
      }
    },
  );

  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen: boolean;
  generalHeadingOpen: boolean;

  // Public inlineRenderer: InlineRenderer | undefined;
  public queryRendererService: QueryRendererV2Service | undefined;
  public eventHandler: EventHandler | undefined;
  public commandHandler: CommandHandler | undefined;
  public settingsManager: SettingsManager | undefined;
  public notesCacheService: NotesCacheService | undefined;
  public handlebarsRenderer: HandlebarsRenderer | undefined;

  // Loading services
  public csvLoaderService: CsvLoaderService | undefined;
  public markdownTableLoaderService: MarkdownTableLoaderService | undefined;
  public jsonLoaderService: JsonLoaderService | undefined;
  public sqlLoaderService: SqlLoaderService | undefined;

  // Settings are rendered in the settings via this. Need to
  // refactor this to use the SettingsTab approach I had.
  showSettings() {
    const tab = this.settingsTab;
    const {settings} = this;
    this.logger.info('Settings Updated', settings);

    tab.initializeTab();
    const settingMainBlockText = `
    <div>
    <br />
<div align="center">
Query All the Things is a flexible way to query and render data in <a href="https://obsidian.md">Obsidian</a> and from other Obsidian plugins. For help on using the plugin please reference the online documentation <a href='https://sytone.github.io/obsidian-queryallthethings/' target='_blank'>here</a>.
<br />
<br />
<a href='https://github.com/sytone/obsidian-queryallthethings/releases/latest'><img src='https://img.shields.io/github/manifest-json/v/sytone/obsidian-queryallthethings?color=blue'></a>
<a href='https://github.com/sytone/obsidian-queryallthethings/releases/latest'><img src='https://img.shields.io/github/release-date/sytone/obsidian-queryallthethings'></a>
<a href='https://github.com/sytone/obsidian-queryallthethings/blob/main/LICENSE'><img src='https://img.shields.io/github/license/sytone/obsidian-queryallthethings'></a>
<a href='https://github.com/sytone/obsidian-queryallthethings'><img src='https://img.shields.io/github/downloads/sytone/obsidian-queryallthethings/total'></a>
<a href='https://github.com/sytone/obsidian-queryallthethings/issues'><img src='https://img.shields.io/github/issues/sytone/obsidian-queryallthethings'></a>
</div>

</div>
`;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.mainHeadingOpen = value;
      });
    };

    tab.addHeading(new SettingsTabHeading({open: this.mainHeadingOpen, text: `Query All The Things (v${this.manifest.version})`, level: 'h1', noticeHtml: settingMainBlockText}), onToggle);

    const onGeneralHeadingToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.generalHeadingOpen = value;
      });
    };

    const generalSettingsSection = tab.addHeading(new SettingsTabHeading({open: this.generalHeadingOpen, text: 'General Settings', level: 'h2', class: 'settings-heading'}), onGeneralHeadingToggle);

    const onChange = async (value: string) => {
      await settings.update(settings => {
        settings.onStartSqlQueries = value;
      });
    };

    const startSQLQueries = tab.addTextAreaInput(
      new SettingsTabField({
        name: 'On Start SQL Queries',
        description: 'If you want to create tables and set data so your queries can use it at a later time without having to duplicate the queries enter them here. These will be executed when the plugin is loaded after the data tables have been initialized.',
        placeholder: GeneralSettingsDefaults.onStartSqlQueries,
        value: this.onStartSqlQueries,
      }),
      onChange,
      generalSettingsSection,
    );

    const announceUpdates = tab.addToggle(
      new SettingsTabField({
        name: 'Announce Updates',
        description: 'If you want to see a notification when the plugin is updated.',
        value: this.announceUpdates,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.announceUpdates = value;
        });
      },
      generalSettingsSection,
    );
  }

  async onload() {
    this.logger.info(`loading plugin "${this.manifest.name}" v${this.manifest.version}`);

    this.use(QueryFactory).load();
    this.use(RenderFactory).load();
    this.use(HandlebarsRenderer).load();

    const dvService = this.use(DataviewService);

    if (!dvService.dataViewEnabled) {
      const dvNotInstalledNotice = new Notice('Dataview plugin is not installed. Dataview backed tables will be empty.');
    }

    // Check for Custom JS
    if (!window.customJS) {
      const dvNotInstalledNotice = new Notice('CustomJS plugin is not installed. Referencing custom scripts in your query blocks will not work.');
    }

    // HandlebarsRenderer.registerHandlebarsHelpers();
    HandlebarsRendererObsidian.registerHandlebarsHelpers();
    AlaSqlQuery.initialize();
    confirmObjectPath('_qatt.ui.promptWithSuggestions', promptWithSuggestions);

    // When layout is ready we can refresh tables and register the query renderer.
    this.app.workspace.onLayoutReady(async () => {
      this.logger.info(`Layout is ready for workspace: ${this.app.vault.getName()}`);

      this.dataTables?.refreshTables('layout ready');

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
      this.notesCacheService = this.use(NotesCacheService);

      this.csvLoaderService = this.use(CsvLoaderService);
      this.markdownTableLoaderService = this.use(MarkdownTableLoaderService);
      this.jsonLoaderService = this.use(JsonLoaderService);
      this.sqlLoaderService = this.use(SqlLoaderService);

      this.queryRendererService = this.use(QueryRendererV2Service);
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

    await this.announceUpdate();
  }

  onunload() {
    this.logger.info(`unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  private async announceUpdate() {
    const currentVersion = this.manifest.version;
    const knownVersion = this.version;

    if (currentVersion === knownVersion) {
      return;
    }

    await this.settings.update(settings => {
      settings.version = currentVersion;
    });

    if (this.announceUpdates) {
      const updateModal = new UpdateModal(knownVersion);
      updateModal.open();
    }
  }
}
