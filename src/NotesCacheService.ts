import { Service, useSettings } from '@ophidian/core';
import type { ListItem } from 'ListItem';
import { Note } from 'Note';
import { SettingsTabField, SettingsTabHeading, useSettingsTab } from 'Settings/DynamicSettingsTabBuilder';
import { type TaskItem } from 'TaskItem';
import alasql from 'alasql';
import { InternalConfigurationService } from 'lib/InternalConfigurationService';
import { LoggingService } from 'lib/LoggingService';
import { MetricsService } from 'lib/MetricsService';
import { DateTime } from 'luxon';
import {
  Notice,
  Plugin,
  type App,
  type CachedMetadata,
  type TFile,
} from 'obsidian';

export interface INotesCacheServiceSettings {
  enableDataViewInlineFieldParsingForTasks: boolean;
  notesCacheSettingsOpen: boolean;
  enableAlaSqlTablePopulation: boolean;
  disableContinualIndexNotifications: boolean;
}

/**
 * Manages a cache of notes and their associated list items.
 * It will trigger 'qatt:notes-store-update' when a note is added, updated or deleted.
 *
 * @export
 * @class NotesCacheService
 * @extends {Service}
 */
export class NotesCacheService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.NotesCacheService');
  metrics = this.use(MetricsService);
  internalConfig = this.use(InternalConfigurationService);

  lastUpdate: DateTime;
  notesCacheSettingsOpen: boolean;
  enableAlaSqlTablePopulation = true;
  disableContinualIndexNotifications = false;
  public allNotesLoaded = false;
  public cachingNotes = false;
  notesDb: any;

  settingsTab = useSettingsTab(this);
  settings = useSettings(
    this,
    {
      enableDataViewInlineFieldParsingForTasks: false,
      notesCacheSettingsOpen: false,
      enableAlaSqlTablePopulation: true,
      disableContinualIndexNotifications: false,
    } as INotesCacheServiceSettings,
    async (settings: INotesCacheServiceSettings) => {
      this.logger.info('NotesCacheService Updated Settings');
      this.enableDataViewInlineFieldParsingForTasks = settings.enableDataViewInlineFieldParsingForTasks;
      this.notesCacheSettingsOpen = settings.notesCacheSettingsOpen;
      this.enableAlaSqlTablePopulation = settings.enableAlaSqlTablePopulation;
      this.disableContinualIndexNotifications = settings.disableContinualIndexNotifications;
    },
    async (settings: INotesCacheServiceSettings) => {
      this.logger.info('NotesCacheService Initialize Settings');
      this.enableDataViewInlineFieldParsingForTasks = settings.enableDataViewInlineFieldParsingForTasks;
      this.notesCacheSettingsOpen = settings.notesCacheSettingsOpen;
      this.enableAlaSqlTablePopulation = settings.enableAlaSqlTablePopulation;
      this.disableContinualIndexNotifications = settings.disableContinualIndexNotifications;

      // This.logger.info('NotesCacheService cacheAllNotes from settings');
      // this.metrics.startMeasurement('cacheAllNotes from settings');
      // await this.cacheAllNotes(app);
      // this.metrics.endMeasurement('cacheAllNotes from settings');
    },
  );

  /**
   * Enable parsing of DataView Inline properties for tasks.
   *
   * If enable this will add any DataView Inline properties to the
   * obsidian_markdown_tasks table as a column.
   *
   * @type {boolean}
   * @memberof NotesCacheService
   */
  enableDataViewInlineFieldParsingForTasks: boolean;

  public notes: Note[] = [];
  public notesMap = new Map<string, Note>();
  public listItemsMap = new Map<string, ListItem>();
  public taskItemMap = new Map<string, TaskItem>();
  // Map of Page to tag, used for quick lookup of tags.
  public tagsNoteMap = new Map<string, string>();
  public ignoredFiles: Record<string, DateTime> = {};

  private get obsidianNotesTableName () {
    return 'obsidian_notes';
  }

  private get obsidianListsTableName () {
    return 'obsidian_lists';
  }

  private get obsidianTasksTableName () {
    return 'obsidian_tasks';
  }

  /**
   * Creates an instance of the NotesCacheService class.
   */
  constructor () {
    super();
    this.lastUpdate = DateTime.now();
    this.metrics.addMetric('NotesCacheService.create Event Count', 0, 'count');
    this.metrics.addMetric('NotesCacheService.changed Event Count', 0, 'count');
    this.metrics.addMetric('NotesCacheService.delete Event Count', 0, 'count');
    this.metrics.addMetric('NotesCacheService.rename Event Count', 0, 'count');
    this.metrics.addMetric('NotesCacheService.changed Ignored Count', 0, 'count');
  }

  /**
   * Displays the settings for the NotesCacheService.
   *
   * @remarks
   * This method creates and adds toggle fields to the settings tab for enabling/disabling certain features.
   *
   * @returns void
   */
  showSettings () {
    const tab = this.settingsTab;
    const { settings } = this;

    const onToggle = async (value: boolean) => {
      await settings.update(settings => {
        settings.notesCacheSettingsOpen = value;
      });
    };

    const settingsSection = tab.addHeading(new SettingsTabHeading({ open: this.notesCacheSettingsOpen, text: 'Notes Cache Settings', level: 'h2', class: 'settings-heading' }), onToggle);

    const toggleInlineFieldParsing = tab.addToggle(
      new SettingsTabField({
        name: 'Enable DataView Inline Field Parsing for Tasks (obsidian_markdown_tasks table)',
        description: 'This enabled processing of any DataView Inline properties added to a task. The name of the property is added to the obsidian_markdown_tasks table as a column. Restart Obsidian to re-cache all files.',
        value: this.enableDataViewInlineFieldParsingForTasks,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.enableDataViewInlineFieldParsingForTasks = value;
        });
      },
      settingsSection,
    );

    const toggleAlaSqlTablePopulation = tab.addToggle(
      new SettingsTabField({
        name: 'Enable direct creation of tables in AlaSQL',
        description: 'This causes tables to be created and updated in memory so queries can be done directly to the AlaSQL database. Allows use in external plugins like templater.',
        value: this.enableAlaSqlTablePopulation,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.enableAlaSqlTablePopulation = value;
        });
      },
      settingsSection,
    );

    const toggleDisableContinualIndexNotifications = tab.addToggle(
      new SettingsTabField({
        name: 'Disable continual index notifications',
        description: 'Disables the continual notifications that the index is being updated. Only two messages will be created, one on start and one on end.',
        value: this.disableContinualIndexNotifications,
      }),
      async (value: boolean) => {
        await settings.update(settings => {
          settings.disableContinualIndexNotifications = value;
        });
      },
      settingsSection,
    );
  }

  async layoutReady () {
    this.logger.info('Layout ready, registering for vault events');

    this.registerEvent(
      this.plugin.app.vault.on('create', async file => {
        this.logger.info(`create event detected for ${file.path}`);
        if (!this.allNotesLoaded) {
          return;
        }

        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        const n = await this.createNoteFromPath(file.path);
        if (n) {
          await this.addNote(file.path, n);
        }

        this.metrics.incrementMetric('NotesCacheService.create Event Count');
        this.metrics.startMeasurement('NotesCacheService.create Event');
        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.metrics.endMeasurement('NotesCacheService.create Event');
      }),
    );

    this.registerEvent(
      this.plugin.app.vault.on('delete', async file => {
        this.logger.info(`delete event detected for ${file.path}`);
        if (!this.allNotesLoaded) {
          return;
        }

        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        this.metrics.incrementMetric('NotesCacheService.delete Event Count');
        this.metrics.startMeasurement('NotesCacheService.delete Event');
        await this.deleteNote(file.path);
        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.metrics.endMeasurement('NotesCacheService.delete Event');
      }),
    );

    this.registerEvent(
      this.plugin.app.vault.on('rename', async (file, oldPath) => {
        this.logger.info(`rename event detected for ${file.path} it was ${oldPath}`);
        if (!this.allNotesLoaded) {
          return;
        }

        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        this.metrics.incrementMetric('NotesCacheService.rename Event Count');
        this.metrics.startMeasurement('NotesCacheService.rename Event');
        const n = await this.createNoteFromPath(file.path);
        if (n) {
          await this.deleteNote(oldPath);
          await this.addNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.metrics.endMeasurement('NotesCacheService.rename Event');
      }),
    );

    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', async (file, data, cache) => {
        if (!this.allNotesLoaded) {
          return;
        }

        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.metrics.incrementMetric('NotesCacheService.changed Ignored Count');

          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        this.metrics.incrementMetric('NotesCacheService.changed Event Count');
        this.metrics.startMeasurement('NotesCacheService.changed Event');
        const startTime = new Date(Date.now());
        const n = await Note.createNewNote(
          file,
          cache,
          data,
        );

        if (n) {
          await this.replaceNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.metrics.endMeasurement('NotesCacheService.changed Event');
      }),
    );
  }

  /**
   * Handles the onload event for the NotesCacheService.
   * This method registers event listeners for various file-related events such as create, delete, rename, and metadataCache changes.
   * When these events occur, the corresponding callback functions are executed to update the notes cache and trigger a workspace update.
   */
  async onload () {
    this.logger.info(`NotesCacheService Last Update: ${this.lastUpdate.toISO() ?? ''}`);
  }

  /**
   * Ignores file events for a specified period of time.
   * @param path - The path of the file to ignore events for.
   * @param period - The duration, in milliseconds, for which to ignore file events.
   */
  public async ignoreFileEventsForPeriod (path: string, period: number) {
    this.ignoredFiles[path] = DateTime.now().plus({ milliseconds: period });
  }

  /**
   * Caches all the notes in the app's vault.
   *
   * @param app - The Obsidian app instance.
   */
  async cacheAllNotes (app: App): Promise<void> {
    this.metrics.startMeasurement('NotesCacheService.cacheAllNotes');
    this.logger.debug('Caching all notes');

    // Const lastUpdate = await alasql.promise('SELECT config_value FROM configuration WHERE config_key =\'lastUpdate\' ');

    // this.logger.info(`Value: '${lastUpdate}'`);

    let fileCount = 0;
    const files = app.vault.getMarkdownFiles();
    // Find the file with the largest modified time.
    // This is the most recent file in the vault.
    // const maxModifiedValue = Math.max(...files.map(item => item.stat.mtime));
    // await alasql.promise('UPDATE configuration SET config_value = ? WHERE config_key = ?', [maxModifiedValue, 'lastUpdate']);
    let indexingNotice = this.disableContinualIndexNotifications ? new Notice('Indexing notes for Query All The Things...', 5000) : new Notice('Indexing notes for Query All The Things...', 0);

    const cachingStartTime = performance.now();
    const noteAdditions = [];

    for (const file of app.vault.getMarkdownFiles()) {
      fileCount++;
      // Show the update of the indexing process if not disabled.
      if (!this.disableContinualIndexNotifications) {
        indexingNotice.setMessage(`Indexing notes for Query All The Things...\n${fileCount}/${files.length}`);
      }

      // eslint-disable-next-line no-await-in-loop
      const note = await this.createNoteFromFile(file);
      this.logger.debug('Caching:', file.path);
      this.logger.debug('Caching:', this.notesMap);

      if (note) {
        noteAdditions.push(this.addNote(file.path, note, false));
        // Old: await this.addNote(file.path, note, true); // eslint-disable-line no-await-in-loop
      }
    }

    await Promise.all(noteAdditions);

    // To increase the speed of loading the collection of tasks and list items
    // is just set as object in alasql.

    await alasql.promise(`SELECT * INTO ${this.obsidianNotesTableName} FROM ?`, [await this.getNotes()]);
    await alasql.promise(`SELECT * INTO ${this.obsidianListsTableName} FROM ?`, [await this.getLists()]);
    await alasql.promise(`SELECT * INTO ${this.obsidianTasksTableName} FROM ?`, [await this.getTasks()]);

    this.allNotesLoaded = true;
    const cachingEndTime = performance.now();
    const executionDuration = (cachingEndTime - cachingStartTime) / 1000;
    indexingNotice = new Notice(`Indexing notes for Query All The Things took ${executionDuration.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}s`, 5000);

    if (!this.disableContinualIndexNotifications) {
      indexingNotice.hide();
    }

    const notesTable = (await alasql.promise(`SELECT COUNT(path) AS cached FROM ${this.obsidianNotesTableName}`)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const listsTable = (await alasql.promise(`SELECT COUNT(path) AS cached FROM ${this.obsidianListsTableName}`)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const tasksTable = (await alasql.promise(`SELECT COUNT(path) AS cached FROM ${this.obsidianTasksTableName}`)); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    this.metrics.addMetric('NotesCacheService Notes Count', notesTable[0].cached as number, 'count');
    this.metrics.addMetric('NotesCacheService Lists Count', listsTable[0].cached as number, 'count');
    this.metrics.addMetric('NotesCacheService Tasks Count', tasksTable[0].cached as number, 'count');

    this.plugin.app.workspace.trigger('qatt:all-notes-loaded');
    this.metrics.endMeasurement('NotesCacheService.cacheAllNotes');
    this.metrics.cacheLoadTime = this.metrics.getMeasurement('NotesCacheService.cacheAllNotes');
    this.cachingNotes = false;
  }

  /**
   * Retrieves all notes from the cache.
   * @returns A promise that resolves to an array of Note objects.
   */
  async getNotes (): Promise<Note[]> {
    return Array.from(this.notesMap.values());
  }

  /**
   * Retrieves all the lists from the cache.
   * @returns A promise that resolves to an array of ListItem objects.
   */
  async getLists (): Promise<ListItem[]> {
    return Array.from(this.listItemsMap.values());
  }

  /**
   * Retrieves all the tasks from the cache.
   * @returns A promise that resolves to an array of TaskItem objects.
   */
  async getTasks (): Promise<TaskItem[]> {
    return Array.from(this.taskItemMap.values());
  }

  /**
   * Retrieves the index of a note in the cache based on its path.
   * @param path - The path of the note.
   * @returns The index of the note in the cache, or -1 if not found.
   */
  async getNoteIndex (path: string): Promise<number> {
    return this.notes.findIndex(n => n.path === path);
  }

  /**
   * Deletes a note from the cache and optionally from the database.
   * @param path - The path of the note to delete.
   */
  async deleteNote (path: string) {
    this.notesMap.delete(path);
    this.deleteListItemsForPath(path);
    this.deleteTasksForPath(path);

    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`DELETE FROM ${this.obsidianNotesTableName} WHERE path = ?;`, [path]);
      await alasql.promise(`DELETE FROM ${this.obsidianListsTableName} WHERE path = ?;`, [path]);
      await alasql.promise(`DELETE FROM ${this.obsidianTasksTableName} WHERE path = ?;`, [path]);
    }
  }

  /**
   * Replaces a note in the cache with the provided note object.
   * If `enableAlaSqlTablePopulation` is enabled, updates the corresponding row in the `markdown_notes` table.
   * Also updates the `listItemsMap` and `taskItemMap` with the list items and task items from the note.
   *
   * @param path - The path of the note to be replaced.
   * @param note - The new note object to replace the existing note.
   */
  async replaceNote (path: string, note: Note) {
    this.notesMap.set(path, note);
    await this.updateNotesTable(note, path);

    this.deleteListItemsForPath(path);
    this.deleteTasksForPath(path);

    const listUpdates = [];
    for (const li of note.listItems) {
      this.listItemsMap.set(`${path}:${li.line}`, li);
      listUpdates.push(this.upsertLists(true, path, li));
    }

    await Promise.all(listUpdates);

    const taskUpdates = [];
    for (const task of note.tasks) {
      this.taskItemMap.set(`${path}:${task.line}`, task);
      taskUpdates.push(this.upsertTasks(true, path, task));
    }

    await Promise.all(taskUpdates);
  }

  /**
   * Adds a note to the cache.
   *
   * @param path - The path of the note.
   * @param note - The note object to be added.
   * @returns A Promise that resolves when the note is added to the cache.
   */
  async addNote (path: string, note: Note, updateTable = true) {
    this.metrics.startMeasurement('addNote');

    this.notesMap.set(path, note);
    await this.upsertNote(updateTable, path, note);

    const listUpdates = [];
    for (const li of note.listItems) {
      const listItemKey = `${path}:${li.line}`;
      this.listItemsMap.set(listItemKey, li);
      listUpdates.push(this.upsertLists(updateTable, path, li));
    }

    await Promise.all(listUpdates);

    const taskUpdates = [];
    for (const task of note.tasks) {
      this.taskItemMap.set(`${path}:${task.line}`, task);
      taskUpdates.push(this.upsertTasks(updateTable, path, task));
    }

    await Promise.all(taskUpdates);

    this.metrics.endMeasurement('addNote');
  }

  /**
   * Creates a Note object from the specified file path.
   *
   * @param path - The path of the file.
   * @returns A Promise that resolves to a Note object if the file exists, otherwise undefined.
   */
  async createNoteFromPath (path: string): Promise<Note | undefined> {
    const f = this.plugin.app.vault
      .getMarkdownFiles()
      .find(f => f.path === path);
    if (f) {
      return this.createNoteFromFile(f);
    }

    return undefined;
  }

  /**
   * Creates a note from a file and returns it.
   * If the file is not cached, it returns undefined.
   *
   * @param file The file to create the note from.
   * @returns A promise that resolves to the created note, or undefined if the file is not cached.
   */
  async createNoteFromFile (file: TFile): Promise<Note | undefined> {
    return this.createNoteFromFileAndCache(
      file,
      this.plugin.app.metadataCache.getFileCache(file) ?? undefined,
    );
  }

  /**
   * Creates a new note from a file and caches its metadata.
   *
   * @param file - The file to create the note from.
   * @param cache - The cached metadata for the note, if available.
   * @returns A promise that resolves to the created note, or undefined if the note couldn't be created.
   */
  async createNoteFromFileAndCache (file: TFile, cache: CachedMetadata | undefined): Promise<Note | undefined> {
    // This will slow down the process of caching all notes. It is needed
    // for the creation of list items.
    const notesContent = await this.plugin.app.vault.cachedRead(file);
    return Note.createNewNote(
      file,
      cache,
      notesContent,
    );
  }

  /**
   * Upserts tasks into the cache.
   *
   * @param updateTable - A boolean indicating whether to update the table.
   * @param path - The path of the note.
   * @param li - The list item.
   * @param task - The task item.
   */
  private async upsertTasks (updateTable: boolean, path: string, task: TaskItem) {
    if (updateTable && this.enableAlaSqlTablePopulation) {
      await this.upsertTable(this.obsidianTasksTableName, path, task.modified, task.line, async () => {
        await this.updateTasksTable(task, path);
      }, async () => {
        await this.insertTasksTable(task);
      });
    }
  }

  /**
   * Upserts the lists in the cache.
   *
   * @param updateTable - A boolean indicating whether to update the table.
   * @param path - The path of the list.
   * @param li - The list item to upsert.
   */
  private async upsertLists (updateTable: boolean, path: string, li: ListItem) {
    if (updateTable && this.enableAlaSqlTablePopulation) {
      await this.upsertTable(this.obsidianListsTableName, path, li.modified, li.line, async () => {
        await this.updateListsTable(li, path);
      }, async () => {
        await this.insertListsTable(li);
      });
    }
  }

  /**
   * Upserts a note in the cache.
   *
   * @param updateTable - A boolean indicating whether to update the table.
   * @param path - The path of the note.
   * @param note - The note to be upserted.
   */
  private async upsertNote (updateTable: boolean, path: string, note: Note) {
    if (updateTable && this.enableAlaSqlTablePopulation) {
      await this.upsertTable(this.obsidianNotesTableName, path, note.modified, undefined, async () => {
        await this.updateNotesTable(note, path);
      }, async () => {
        await this.insertNotesTable(note, path);
      });
    }
  }

  /**
   * Upserts a table in the database.
   *
   * @param tableName - The name of the table to upsert.
   * @param path - The path to query in the table.
   * @param line - The line number to query in the table (optional).
   * @param updateFn - The function to execute when the query returns a matching row.
   * @param insertFn - The function to execute when the query does not return any matching rows.
   */
  // eslint-disable-next-line max-params
  private async upsertTable (tableName: string, path: string, modified: number, line: number | undefined, updateFn: () => Promise<void>, insertFn: () => Promise<void>) {
    const query = line ? `SELECT path, modified FROM ${tableName} WHERE path = ? AND line = ?` : `SELECT path, modified FROM ${tableName} WHERE path = ?`;
    const parameters = line ? [path, line] : [path];

    const result = await alasql.promise(query, parameters); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    if (result.length > 0 && result[0].modified < modified) {
      await updateFn();
    }

    if (result.length === 0) {
      await insertFn();
    }
  }

  /**
   * Deletes list items for a given path.
   * @param path - The path to delete list items for.
   */
  private deleteListItemsForPath (path: string) {
    for (const key of this.listItemsMap.keys()) {
      if (key.startsWith(`${path}:`)) {
        this.listItemsMap.delete(key);
      }
    }
  }

  /**
   * Deletes all tasks associated with the specified path.
   * @param path - The path for which tasks should be deleted.
   */
  private deleteTasksForPath (path: string) {
    for (const key of this.taskItemMap.keys()) {
      if (key.startsWith(`${path}:`)) {
        this.taskItemMap.delete(key);
      }
    }
  }

  /**
   * Checks if a file should be ignored based on the provided file path.
   * @param file - The file path to check.
   * @returns True if the file should be ignored, false otherwise.
   */
  private checkIfFileShouldBeIgnored (file: string) {
    return this.ignoredFiles[file] && this.ignoredFiles[file] > DateTime.now();
  }

  /**
   * Updates the notes table with the provided note data.
   *
   * @param note - The note object containing the updated data.
   * @param path - The path of the note to be updated.
   */
  private async updateNotesTable (note: Note, path: string) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`UPDATE ${this.obsidianNotesTableName} SET content = ?, internalPath = ?, name = ?, parentFolder = ?, basename = ?, extension = ?, created = ?, modified = ?, size = ?, links = ?, embeds = ?, tags = ?, headings = ?, sections = ?, listItems = ?, frontmatter = ?, blocks = ?, stat = ? WHERE path = ? AND modified < ?`, [
        note.content,
        note.internalPath,
        note.name,
        note.parentFolder,
        note.basename,
        note.extension,
        note.created,
        note.modified,
        note.size,
        note.links,
        note.embeds,
        note.tags,
        note.headings,
        note.sections,
        note.listItems,
        note.frontmatter,
        note.blocks,
        note.stat,
        path,
        note.modified,
      ]);
    }
  }

  /**
   * Inserts a note into the obsidian_notes table.
   *
   * @param note - The note object to be inserted.
   * @param path - The path of the note.
   */
  private async insertNotesTable (note: Note, path: string) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`INSERT INTO ${this.obsidianNotesTableName} VALUES ?`, [{
        content: note.content,
        path,
        internalPath: note.internalPath,
        name: note.name,
        parentFolder: note.parentFolder,
        basename: note.basename,
        extension: note.extension,
        created: note.created,
        modified: note.modified,
        size: note.size,
        links: note.links,
        embeds: note.embeds,
        tags: note.tags,
        headings: note.headings,
        sections: note.sections,
        listItems: note.listItems,
        frontmatter: note.frontmatter,
        blocks: note.blocks,
        stat: note.stat,
      }]);
    }
  }

  /**
   * Updates the 'obsidian_lists' table with the provided values for a specific path and line.
   * This method is only executed if 'enableAlaSqlTablePopulation' is true.
   *
   * @param li - The ListItem object containing the updated values.
   * @param path - The path of the note.
   */
  private async updateListsTable (li: ListItem, path: string) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`UPDATE ${this.obsidianListsTableName} SET parent = ?, task = ?, content = ?, line = ?, [column] = ?, isTopLevel = ?, path = ?, modified = ?, text = ?, checked = ?, status = ?, heading = ?, isTask = ? WHERE path = ? AND line = ? AND modified < ?`, [
        li.parent,
        li.task,
        li.content,
        li.line,
        li.column,
        li.isTopLevel,
        li.path,
        li.modified,
        li.text,
        li.checked,
        li.status,
        li.heading,
        li.isTask,
        path,
        li.line,
        li.modified,
      ]);
    }
  }

  /**
   * Inserts a list item into the obsidian_lists table.
   *
   * @param li - The list item to insert.
   */
  private async insertListsTable (li: ListItem) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`INSERT INTO ${this.obsidianListsTableName} VALUES ?`, [{
        parent: li.parent,
        task: li.task,
        content: li.content,
        line: li.line,
        column: li.column,
        isTopLevel: li.isTopLevel,
        path: li.path,
        modified: li.modified,
        text: li.text,
        checked: li.checked,
        status: li.status,
        heading: li.heading,
        isTask: li.isTask,
      }]);
    }
  }

  /**
   * Updates the tasks table with the provided task item.
   *
   * @param task - The task item to update.
   * @param path - The path of the task item.
   * @param li - The list item associated with the task item.
   */
  private async updateTasksTable (task: TaskItem, path: string) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`UPDATE ${this.obsidianTasksTableName} SET path = ?, modified = ?, task = ?, status = ?, content = ?, text = ?, line = ?, tags = ?, tagsNormalized = ?, dueDate = ?, doneDate = ?, startDate = ?, createDate = ?, scheduledDate = ?, doDate = ?, priority = ?, cleanTask = ?, heading = ?, blockLink = ? WHERE path = ? AND line = ? AND modified < ?`, [
        task.path,
        task.modified,
        task.task,
        task.status,
        task.content,
        task.text,
        task.line,
        task.tags,
        task.tagsNormalized,
        task.dueDate,
        task.doneDate,
        task.startDate,
        task.createDate,
        task.scheduledDate,
        task.doDate,
        task.priority,
        task.cleanTask,
        task.heading,
        task.blockLink,
        path,
        task.line,
        task.modified,
      ]);
    }
  }

  /**
   * Inserts a task item into the `obsidian_tasks` table.
   *
   * @param task - The task item to be inserted.
   */
  private async insertTasksTable (task: TaskItem) {
    if (this.enableAlaSqlTablePopulation) {
      await alasql.promise(`INSERT INTO ${this.obsidianTasksTableName} VALUES ?`, [{
        path: task.path,
        task: task.task,
        modified: task.modified,
        status: task.status,
        content: task.content,
        text: task.text,
        line: task.line,
        tags: task.tags,
        tagsNormalized: task.tagsNormalized,
        dueDate: task.dueDate,
        doneDate: task.doneDate,
        startDate: task.startDate,
        createDate: task.createDate,
        scheduledDate: task.scheduledDate,
        doDate: task.doDate,
        priority: task.priority,
        cleanTask: task.cleanTask,
        heading: task.heading,
        blockLink: task.blockLink,
      }]);
    }
  }
}
