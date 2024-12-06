/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {CommandHandler} from 'handlers/CommandHandler';
import {confirmObjectPath, promptForInput, promptWithSuggestions} from 'Internal';
import {CsvLoaderService} from 'Data/CsvLoaderService';
import {DataTables} from 'Data/DataTables';
import {DataviewService} from 'Integrations/DataviewService';
import {HandlebarsRenderer} from 'Render/HandlebarsRenderer';
import {JsonLoaderService} from 'Data/JsonLoaderService';
import {LoggingService} from 'lib/LoggingService';
import {MarkdownTableLoaderService} from 'Data/MarkdownTableLoaderService';
import {NotesCacheService} from 'NotesCacheService';
import {QueryFactory} from 'Query/QueryFactory';
import {QueryRendererV2Service} from 'QueryRendererV2Service';
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
import {MetricsService} from 'lib/MetricsService';
import {createEditorMenu} from 'UI/EditorMenu';

export interface IGeneralSettings {
  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen: boolean;
  generalHeadingOpen: boolean;
  internalLoggingConsoleLogLimit: number;
  disableDataviewMissingNotification: boolean;
  disableCustomJsMissingNotification: boolean;
  enableEditorRightClickMenu: boolean;
}

/**
 * Represents the QueryAllTheThingsPlugin class.
 * This class extends the Plugin class and implements the IQueryAllTheThingsPlugin interface.
 * It provides functionality for querying and rendering data in Obsidian and from other Obsidian plugins.
 */
export default class QueryAllTheThingsPlugin extends Plugin implements IQueryAllTheThingsPlugin {
  use = use.plugin(this);
  loggingService = this.use(LoggingService);
  logger = this.loggingService.getLogger('Qatt');
  metrics = this.use(MetricsService);
  dataTables = this.use(DataTables);
  commandHandler = this.use(CommandHandler);
  eventHandler = this.use(EventHandler);
  releaseNotes = this.use(ReleaseNotes);
  windowFunctions = this.use(WindowFunctionsService);
  coreSystemInitialized = false;
  layoutReady = false;

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

  settingsTab = useSettingsTab(this);

  settings = useSettings(
    this,
    {
      onStartSqlQueries: 'CREATE TABLE my_lookup(name,birthday);\nINSERT INTO my_lookup VALUES ("fred", 2000-02-03);',
      announceUpdates: false,
      version: '',
      mainHeadingOpen: true,
      generalHeadingOpen: false,
      internalLoggingConsoleLogLimit: 10,
      disableDataviewMissingNotification: false,
      disableCustomJsMissingNotification: false,
      enableEditorRightClickMenu: true,
    } as IGeneralSettings,
    async (settings: IGeneralSettings) => {
      // This will run every time the settings are updated.
      this.logger.info('Settings Updated', settings);
      this.onStartSqlQueries = settings.onStartSqlQueries;
      this.announceUpdates = settings.announceUpdates;
      this.version = settings.version;
      this.mainHeadingOpen = settings.mainHeadingOpen;
      this.generalHeadingOpen = settings.generalHeadingOpen;
      this.internalLoggingConsoleLogLimit = settings.internalLoggingConsoleLogLimit;
      this.enableEditorRightClickMenu = settings.enableEditorRightClickMenu;
      this.commandHandler.setup(settings.internalLoggingConsoleLogLimit);
    },
    async (settings: IGeneralSettings) => {
      // This will run when the settings are first loaded.
      this.logger.info('Settings Initialize', settings);
      this.onStartSqlQueries = settings.onStartSqlQueries;
      this.announceUpdates = settings.announceUpdates;
      this.version = settings.version;
      this.mainHeadingOpen = settings.mainHeadingOpen;
      this.generalHeadingOpen = settings.generalHeadingOpen;
      this.internalLoggingConsoleLogLimit = settings.internalLoggingConsoleLogLimit;
      this.enableEditorRightClickMenu = settings.enableEditorRightClickMenu;
      this.commandHandler.setup(settings.internalLoggingConsoleLogLimit);

      // This is the start of all the events that need to be run to get the system into the correct state. The
      // event qatt:data-local-database-setup-completed is fired when completed.
      await this.dataTables.setupLocalDatabase();

      if (!app.plugins.enabledPlugins.has('dataview') && !settings.disableDataviewMissingNotification) {
        const dvNotInstalledNotice = new Notice('Dataview plugin is not installed. Dataview backed tables will be empty.');
      }

      if (!app.plugins.enabledPlugins.has('customjs') && !settings.disableCustomJsMissingNotification) {
        const dvNotInstalledNotice = new Notice('CustomJS plugin is not installed. Referencing custom scripts in your query blocks will not work.');
      }

      // It has an internal check to see if enabled.
      void this.announceUpdate();
    },
  );
  // #region Plugin Settings UI
  /* -------------------------------------------------------------------------- */
  /*                            Plugin wide settings                            */
  /* -------------------------------------------------------------------------- */

  onStartSqlQueries: string;
  announceUpdates: boolean;
  version: string;
  mainHeadingOpen = true;
  generalHeadingOpen: boolean;
  internalLoggingConsoleLogLimit: number;
  enableEditorRightClickMenu = true;
  enableAlaSqlIndexedDbUse: boolean;

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
<br />
Some settings are experimental, these are indicated by a 🧪 at the start of the name.
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

    tab.addToggle(
      new SettingsTabField({
        name: 'Disable Dataview Missing Notification',
        description: 'Disables the Dataview plugin missing notification.',
        value: settings.current?.disableDataviewMissingNotification,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.disableDataviewMissingNotification = value;
        });
      },
      generalSettingsSection,
    );

    tab.addToggle(
      new SettingsTabField({
        name: 'Disable CustomJS Missing Notification',
        description: 'Disables the CustomJS plugin missing notification.',
        value: settings.current?.disableCustomJsMissingNotification,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.disableCustomJsMissingNotification = value;
        });
      },
      generalSettingsSection,
    );
  }
  // #endregion

  /**
   * Initializes the plugin when the application loads.
   * This function sets up various services, registers event listeners, and performs necessary setup tasks.
   * It also adds ribbon icons for manual table refresh, view refresh, and logging metrics.
   * @returns {Promise<void>} A promise that resolves once the plugin is loaded.
   */
  async onload() {
    this.metrics.startMeasurement('plugin onload');

    this.logger.info(`loading plugin "${this.manifest.name}" v${this.manifest.version}`);
    this.logger.debug(`debug level enabled "${this.manifest.name}" v${this.manifest.version}`);

    // Load up the services to be used later.
    this.use(QueryFactory).load();
    this.use(RenderFactory).load();
    this.use(HandlebarsRenderer).load();
    this.use(DataviewService).load();

    // Make custom functions available to the window object.
    confirmObjectPath('_qatt.ui.promptWithSuggestions', promptWithSuggestions);
    confirmObjectPath('_qatt.ui.promptForInput', promptForInput);

    // Once all the base db and tables are created refresh the inbuilt tables. Also dataview if enabled.
    // Will fire qatt:data-local-database-setup-completed when completed.
    this.registerEvent(this.app.workspace.on('qatt:data-local-database-setup-completed', async () => {
      this.logger.info('qatt:data-local-database-setup-completed event detected.');

      // Wait until layout ready has been fired before we start the cache loading.
      // This is to ensure that all notes are loaded.
      const checkCoreSetupInterval = setInterval(async () => {
        if (this.layoutReady) {
          clearInterval(checkCoreSetupInterval);
          this.logger.info('Layout is ready, starting core setup.');
          await this.initializeCoreServices();
        }
      }, 500);

      const checkInterval = setInterval(async () => {
        if (this.layoutReady && this.coreSystemInitialized) {
          clearInterval(checkInterval);
          this.logger.info('Layout is ready, starting cache loading.');
          /* ------------------------- Setup and prepare the notes caching service ------------------------- */
          this.metrics.startMeasurement('NotesCacheService Use');
          this.notesCacheService = this.use(NotesCacheService);
          this.metrics.endMeasurement('NotesCacheService Use');
          await this.notesCacheService.layoutReady();

          await this.notesCacheService.cacheAllNotes(this.app);
        }
      }, 500);
    }));

    this.registerEvent(this.app.workspace.on('qatt:all-notes-loaded', async () => {
      /* ------------------------- Register for cache load callback to run SQL ------------------------- */
      // After all notes are cached the qatt:all-notes-loaded event is triggered. We should always run the SQL
      // based loader service as it may query data in the notes.
      this.logger.info('qatt:all-notes-loaded event detected.');
      this.initializeSqlLoaderService();
    }));

    // When layout is ready we can refresh tables and register the query renderer.
    this.app.workspace.onLayoutReady(async () => {
      this.logger.info(`onLayoutReady fired for workspace: ${this.app.vault.getName()}`);

      this.layoutReady = true;

      /* ------------------------- DataView based support ------------------------- */
      const dvService = this.use(DataviewService);
      if (dvService.dataViewEnabled) {
        // Refresh tables when dataview index is ready.
        this.registerEvent(this.app.metadataCache.on('dataview:index-ready', async () => {
          this.logger.info('dataview:index-ready event detected.');
          await this.dataTables.refreshTables('dataview:index-ready event detected');
        }));

        this.registerEvent(this.app.workspace.on('dataview:refresh-views', async () => {
          this.logger.info('dataview:refresh-views event detected.');
          await this.dataTables.refreshTables('dataview:refresh-views event detected');
        }));
      }

      this.logger.info(`onLayoutReady completed for workspace: ${this.app.vault.getName()}`);
    });

    // Allow user to refresh the tables manually.
    this.addRibbonIcon('refresh-cw', 'Refresh QATT Tables', async (evt: MouseEvent) => {
      this.logger.info(`Refresh QATT Tables: ${evt.button}`);
      await this.dataTables.refreshTables('manual refresh');
    });

    this.addRibbonIcon('list-restart', 'Refresh Views', async (evt: MouseEvent) => {
      this.logger.info(`Refresh all Views: ${evt.button}`);
      this.app.workspace.trigger('qatt:all-notes-loaded');
    });

    this.addRibbonIcon('ruler', 'Log Metrics', (evt: MouseEvent) => {
      this.logger.info(`Log Metrics: ${evt.button}`);
      this.logger.info(this.metrics.getPluginMetrics());
    });

    this.eventHandler.setup();

    this.registerEvent(this.app.workspace.on('qatt:force-cache-reload', async () => {
      this.logger.info('qatt:force-cache-reload event detected.');

      if (this.notesCacheService) {
        await this.notesCacheService.cacheAllNotes(this.app);
      }
    }));

    if (this.enableEditorRightClickMenu) {
      this.registerEvent(
        this.app.workspace.on('editor-menu', (menu, editor) => {
          createEditorMenu(menu, editor);
        }),
      );
    }

    this.metrics.endMeasurement('plugin onload');
    this.metrics.pluginLoadTime = this.metrics.getMeasurement('plugin onload');
  }

  onunload() {
    this.logger.info(`unloading plugin "${this.manifest.name}" v${this.manifest.version}`);
  }

  /**
   * This will show the latest update notes if the version has changed.
   *
   * @return {*}
   * @memberof QueryAllTheThingsPlugin
   */
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

  private initializeSqlLoaderService() {
    this.metrics.startMeasurement('SqlLoaderService Use');
    this.sqlLoaderService = this.use(SqlLoaderService);
    this.metrics.endMeasurement('SqlLoaderService Use');
  }

  /**
   * Initializes the core services.
   * This method performs the following tasks:
   * 1. Refreshes the tables internally used.
   * 2. Runs any on start SQL queries once the tables are setup.
   * 3. Pulls in the CVS, Markdown, or JSON data.
   * 4. Uses the CsvLoaderService, MarkdownTableLoaderService, JsonLoaderService, and QueryRendererV2Service.
   *
   * @returns {Promise<void>} A promise that resolves once the core services are initialized.
   */
  private async initializeCoreServices() {
    // Refresh the tables internally used.
    await this.dataTables.refreshTables('called by initializeCoreServices');

    // Run any on start SQL queries once the tables are setup.
    if (this.onStartSqlQueries) {
      this.logger.info('Running on start SQL queries', this.onStartSqlQueries);
      const onStartResult = await this.dataTables.runAdhocQuery(this.onStartSqlQueries);
      this.logger.info('On start SQL queries result', onStartResult);
    }

    /* ------------------------- Pull in the CVS, Markdown or JSON data ------------------------- */
    this.metrics.startMeasurement('CsvLoaderService Use');
    this.csvLoaderService = this.use(CsvLoaderService);
    this.metrics.endMeasurement('CsvLoaderService Use');

    this.metrics.startMeasurement('MarkdownTableLoaderService Use');
    this.markdownTableLoaderService = this.use(MarkdownTableLoaderService);
    this.metrics.endMeasurement('MarkdownTableLoaderService Use');

    this.metrics.startMeasurement('JsonLoaderService Use');
    this.jsonLoaderService = this.use(JsonLoaderService);
    this.metrics.endMeasurement('JsonLoaderService Use');

    this.metrics.startMeasurement('QueryRendererV2Service Use');
    this.queryRendererService = this.use(QueryRendererV2Service);
    this.metrics.endMeasurement('QueryRendererV2Service Use');

    this.coreSystemInitialized = true;
  }
}
