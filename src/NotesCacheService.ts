import {
  Plugin,
  type TFile,
  type CachedMetadata,
} from 'obsidian';
import {Service} from '@ophidian/core';
import {LoggingService} from 'lib/LoggingService';
import {DateTime} from 'luxon';
import {Note} from 'Note';
import type {ListItem} from 'ListItem';

export class NotesCacheService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.NotesCacheService');
  lastUpdate: DateTime;
  public notes: Note[] = [];

  public notesMap = new Map<string, Note>();
  public listItemsMap = new Map<string, ListItem>();
  public ignoredFiles: Record<string, DateTime> = {};

  constructor() {
    super();
    this.lastUpdate = DateTime.now();
  }

  async onload() {
    this.logger.info(`NotesCacheService Last Update: ${this.lastUpdate.toISO() ?? ''}`);
    const app = this.plugin.app;
    const startTime = new Date(Date.now());

    for (const file of app.vault.getMarkdownFiles()) {
      // eslint-disable-next-line no-await-in-loop
      const note = await this.createNoteFromFile(file);
      if (note) {
      // eslint-disable-next-line no-await-in-loop
        await this.addNote(file.path, note);
      }
    }

    const endTime = new Date(Date.now());
    this.logger.info(`NotesCacheService Loaded ${this.notesMap.size} items in ${endTime.getTime() - startTime.getTime()}ms`);
    this.registerEvent(
      this.plugin.app.vault.on('create', async file => {
        this.logger.info(`create event detected for ${file.path}`);

        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        const startTime = new Date(Date.now());
        const n = await this.createNoteFromPath(file.path);
        if (n) {
          await this.addNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    // Modify will be handed via the metadataCache changed event.
    // this.registerEvent(this.plugin.app.vault.on('modify', file => {
    //   this.logger.info(`modify event detected for ${file.path}`);
    //   const startTime = new Date(Date.now());
    //   const modifiedFile = this.plugin.app.vault.getMarkdownFiles().find(f => f.path === file.path);
    //   const fileIndex = this.notes.findIndex(n => n.markdownFile.path === file.path);
    //   if (modifiedFile) {
    //     this.notes[fileIndex] = new Note(modifiedFile, this.plugin.app.metadataCache.getFileCache(modifiedFile) ?? undefined, this.use);
    //   }

    //   this.plugin.app.workspace.trigger('qatt:notes-store-update');
    //   this.logger.info(`NotesCacheService Updated in ${(new Date(Date.now())).getTime() - startTime.getTime()}ms`);
    // }));

    this.registerEvent(
      this.plugin.app.vault.on('delete', async file => {
        this.logger.info(`delete event detected for ${file.path}`);
        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        const startTime = new Date(Date.now());
        await this.deleteNote(file.path);
        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    this.registerEvent(
      this.plugin.app.vault.on('rename', async (file, oldPath) => {
        this.logger.info(`rename event detected for ${file.path}`);
        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        const startTime = new Date(Date.now());
        const n = await this.createNoteFromPath(file.path);
        if (n) {
          await this.deleteNote(oldPath);
          await this.addNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', async (file, data, cache) => {
        this.logger.info(`metadataCache changed event detected for ${file.path}`);
        // Return if the file is in the ignore list and the time has not expired.
        if (this.checkIfFileShouldBeIgnored(file.path)) {
          this.logger.info(`skipping update for ${file.path} as it is being ignored for a period.`);
          return;
        }

        const startTime = new Date(Date.now());
        const n = await this.createNoteFromFileAndCache(file, cache);
        if (n) {
          await this.replaceNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );
  }

  public async ignoreFileEventsForPeriod(path: string, period: number) {
    this.ignoredFiles[path] = DateTime.now().plus({milliseconds: period});
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notesMap.values());
  }

  async getLists(): Promise<ListItem[]> {
    console.log(this.listItemsMap);
    return Array.from(this.listItemsMap.values());
  }

  async getNoteIndex(path: string): Promise<number> {
    return this.notes.findIndex(n => n.path === path);
  }

  async deleteNote(path: string) {
    this.notesMap.delete(path);
  }

  async replaceNote(path: string, note: Note) {
    this.notesMap.set(path, note);
    for (const key of this.listItemsMap.keys()) {
      if (key.startsWith(`${path}:`)) {
        this.listItemsMap.delete(key);
      }
    }

    for (const li of note.listItems) {
      this.listItemsMap.set(`${path}:${li.line}`, li);
    }
  }

  async addNote(path: string, note: Note) {
    this.notesMap.set(path, note);
    for (const li of note.listItems) {
      this.listItemsMap.set(`${path}:${li.line}`, li);
    }
  }

  async createNoteFromPath(path: string): Promise<Note | undefined> {
    const f = this.plugin.app.vault
      .getMarkdownFiles()
      .find(f => f.path === path);
    if (f) {
      return this.createNoteFromFile(f);
    }

    return undefined;
  }

  async createNoteFromFile(file: TFile): Promise<Note | undefined> {
    return this.createNoteFromFileAndCache(
      file,
      this.plugin.app.metadataCache.getFileCache(file) ?? undefined,
    );
  }

  async createNoteFromFileAndCache(file: TFile, cache: CachedMetadata | undefined): Promise<Note | undefined> {
    const notesContent = await this.plugin.app.vault.cachedRead(file);

    return Note.createNewNote(
      file,
      cache,
      notesContent,
    );
  }

  private checkIfFileShouldBeIgnored(file: string) {
    return this.ignoredFiles[file] && this.ignoredFiles[file] > DateTime.now();
  }
}
