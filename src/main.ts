/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {AlaSqlQuery} from 'Query/AlaSqlQuery';
import {CommandHandler} from 'handlers/CommandHandler';
import {confirmObjectPath, promptWithSuggestions} from 'Internal';
import {CsvLoaderService} from 'Data/CsvLoaderService';
import {DataTables} from 'Data/DataTables';
import {DataviewService} from 'Integrations/DataviewService';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {JsonLoaderService} from 'Data/JsonLoaderService';
import {LoggingService} from 'lib/LoggingService';
import {MarkdownTableLoaderService} from 'Data/MarkdownTableLoaderService';
import {NotesCacheService} from 'NotesCacheService';
import {QueryFactory} from 'Query/QueryFactory';
import {QueryRendererV2Service} from 'QueryRendererV2';
import {ReleaseNotes} from 'ReleaseNotes';
import {RenderFactory} from 'Render/RenderFactory';
import {SettingsTabField, SettingsTabHeading, useSettingsTab} from 'Settings/DynamicSettingsTabBuilder';
import {SqlLoaderService} from 'Data/SqlLoaderService';
import {type CachedMetadata, Notice, Plugin, type TFile} from 'obsidian';
import {type IQueryAllTheThingsPlugin} from 'Interfaces/IQueryAllTheThingsPlugin';
import {type SettingsManager} from 'Settings/SettingsManager';
import {UpdateModal} from 'lib/UpdateModal';
import {use, useSettings} from '@ophidian/core';
import {EventHandler} from 'handlers/EventHandler';
import {WindowFunctionsService} from 'lib/WindowFunctionsService';

export class Note {
  constructor(public markdownFile: TFile, public metadata: CachedMetadata | undefined) {}
}

export interface IGeneralSettings {
  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen: boolean;
  generalHeadingOpen: boolean;
  internalLoggingConsoleLogLimit: number;
}

export const GeneralSettingsDefaults: IGeneralSettings = {
  onStartSqlQueries: 'CREATE TABLE my_lookup(name,birthday);\nINSERT INTO my_lookup VALUES ("fred", 2000-02-03);',
  announceUpdates: true,
  version: '',
  mainHeadingOpen: true,
  generalHeadingOpen: false,
  internalLoggingConsoleLogLimit: 10,
};

export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  use = use.plugin(this);
  logger = this.use(LoggingService).getLogger('Qatt');
  dataTables = this.use(DataTables);
  commandHandler = this.use(CommandHandler);
  eventHandler = this.use(EventHandler);
  releaseNotes = this.use(ReleaseNotes);
  windowFunctions = this.use(WindowFunctionsService);

  /* -------------------------------------------------------------------------- */
  /*                            Plugin wide settings                            */
  /* -------------------------------------------------------------------------- */
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
      this.internalLoggingConsoleLogLimit = settings.internalLoggingConsoleLogLimit;
      this.commandHandler.setup(settings.internalLoggingConsoleLogLimit);
    },
    (settings: IGeneralSettings) => {
      // This will run when the settings are first loaded.
      this.logger.info('Settings Initialize', settings);
      this.onStartSqlQueries = settings.onStartSqlQueries;
      this.announceUpdates = settings.announceUpdates;
      this.version = settings.version;
      this.mainHeadingOpen = settings.mainHeadingOpen;
      this.generalHeadingOpen = settings.generalHeadingOpen;
      this.internalLoggingConsoleLogLimit = settings.internalLoggingConsoleLogLimit;
      this.commandHandler.setup(settings.internalLoggingConsoleLogLimit);

      if (this.onStartSqlQueries) {
        this.logger.info('Running on start SQL queries', this.onStartSqlQueries);
        const onStartResult = this.dataTables?.runAdhocQuery(this.onStartSqlQueries);
        this.logger.info('On start SQL queries result', onStartResult);
      }

      this.announceUpdate();

    },
  );

  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen: boolean;
  generalHeadingOpen: boolean;
  internalLoggingConsoleLogLimit: number;

  // Public inlineRenderer: InlineRenderer | undefined;
  public queryRendererService: QueryRendererV2Service | undefined;
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

    const consoleLogingLimit = tab.addTextInput(
      new SettingsTabField({
        name: 'Console Logging Limit',
        description: 'The number of rows to show when dumping the internal logging to the console.',
        value: this.internalLoggingConsoleLogLimit,
      }),
      async (value: string) => {
        await settings.update(settings => {
          settings.internalLoggingConsoleLogLimit = value as unknown as number;
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
    this.use(DataviewService).load();

    AlaSqlQuery.initialize();
    confirmObjectPath('_qatt.ui.promptWithSuggestions', promptWithSuggestions);

    // When layout is ready we can refresh tables and register the query renderer.
    this.app.workspace.onLayoutReady(async () => {
      this.logger.info(`Layout is ready for workspace: ${this.app.vault.getName()}`);

      this.dataTables?.refreshTables('layout ready');

      this.notesCacheService = this.use(NotesCacheService);
      this.csvLoaderService = this.use(CsvLoaderService);
      this.markdownTableLoaderService = this.use(MarkdownTableLoaderService);
      this.jsonLoaderService = this.use(JsonLoaderService);
      this.sqlLoaderService = this.use(SqlLoaderService);
      this.queryRendererService = this.use(QueryRendererV2Service);

      /* ------------------------- DataView based support ------------------------- */
      const dvService = this.use(DataviewService);
      if (dvService.dataViewEnabled) {
        // Refresh tables when dataview index is ready.
        this.registerEvent(this.app.metadataCache.on('dataview:index-ready', () => {
          this.logger.info('dataview:index-ready event detected.');
          this.dataTables?.refreshTables('dataview:index-ready event detected');
        }));

        this.registerEvent(this.app.workspace.on('dataview:refresh-views', () => {
          this.logger.info('dataview:refresh-views event detected.');
          this.dataTables?.refreshTables('dataview:refresh-views event detected');
        }));
      } else {
        const dvNotInstalledNotice = new Notice('Dataview plugin is not installed. Dataview backed tables will be empty.');
      }

      /* ------------------------- Custom JS based support ------------------------- */
      if (!app.plugins.enabledPlugins.has('customjs')) {
        const dvNotInstalledNotice = new Notice('CustomJS plugin is not installed. Referencing custom scripts in your query blocks will not work.');
      }
    });

    // Allow user to refresh the tables manually.
    this.addRibbonIcon('refresh-cw', 'Refresh QATT Tables', (evt: MouseEvent) => {
      this.logger.info(`Refresh QATT Tables: ${evt.button}`);
      this.dataTables?.refreshTables('manual refresh');
    });

    this.eventHandler.setup();

  }

  onunload() {
    this.logger.info(`unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  public async announceUpdate() {
    const currentVersion = this.manifest.version;
    const knownVersion = this.version;
    this.logger.info(`Current version: ${currentVersion}, Known version: ${knownVersion}`);

    if (currentVersion === knownVersion) {
      this.logger.info('No update announcements');

      return;
    }

    // Add all release notes from this.manifest.releases.
    // This is a map of version to release notes.
    // The release notes are in markdown format.
    for (const release of this.manifest.releases) {
      for (const [key, value] of Object.entries(release)) {
        this.logger.info(`Adding release notes for ${key} ${value}`, release);
        this.releaseNotes.addVersion(key, value);
      }
    }

    this.logger.info('Adding release notes for:', this.releaseNotes.getChangesSince(knownVersion));

    await this.settings.update(settings => {
      settings.version = currentVersion;
    });

    if (this.announceUpdates) {
      const updateModal = new UpdateModal(knownVersion, this.releaseNotes);
      updateModal.open();
      updateModal.display();
    } else {
      this.logger.info('Update announcements disabled.');
    }
  }
}
