import {
  Plugin,
  type TFile,
  type CachedMetadata,
  type LinkCache,
  type EmbedCache,
  type TagCache,
  type HeadingCache,
  type SectionCache,
  type ListItemCache,
  type FrontMatterCache,
  type BlockCache,
  type FileStats,
  TFolder,
} from 'obsidian';
import {type Context, Service, use} from '@ophidian/core';
import {LoggingService, type Logger} from 'lib/LoggingService';
import {DateTime} from 'luxon';

/*
Update the table below when new columns are added so documentation is updated.
// >> id='docs-tables-obsidian-markdown-notes' options=''

If you need to reference a property of a object do not forget to use `->` and not `.`

| Column Name | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| content        | string | Full content of the markdown note.                |
| path        | string | Full path to the markdown note.                 |
| internalPath        | string | Full path to the markdown note minus the extension.                 |
| name        | string | The name of the note including the extension.   |
| parentFolder        | string | The path of the parent folder for this note.   |
| basename    | number | Just the name of the note.                      |
| extension   | number | The extension of the note. Usually `md`         |
| stat        | object | contains the time and size details of the note. |
| stat->ctime | number | Time the note was creates as a serial.          |
| stat->mtime | number | Time the note was last modified as a serial.    |
| stat->size  | number | Size of the note in bytes                       |
| links  | [LinkCache[]](#linkcache-structure) | Array of links cached by Obsidian                     |
| embeds  | [EmbedCache[]](#embedcache-structure) | Array of embeds cached by Obsidian                     |
| tags  | string[] | Array of tags cached by Obsidian                     |
| headings  | [HeadingCache[]](#headingcache-structure) | Array of headings cached by Obsidian                     |
| sections  | [SectionCache[]](#sectioncache-structure) | Array of sections cached by Obsidian                     |
| listItems  | [ListItem[]](#listcache-structure) | Array of listItems cached by Obsidian                     |
| frontmatter  | [FrontMatterCache[]](#frontmattercache-structure) | Array of frontmatter cached by Obsidian                     |
| blocks  | Record<string, BlockCache> | Array of blocks cached by Obsidian                     |

// << docs-tables-obsidian-markdown-notes
*/

export class Note {
  public static async createNewNote(markdownFile: TFile,
    metadata: CachedMetadata | undefined,
    content: string,
  ): Promise<Note> {
    const n = new Note();
    n.content = content;
    n.path = markdownFile.path;
    n.name = markdownFile.name;
    n.internalPath = markdownFile.path.replace(`.${markdownFile.extension}`, '');

    n.stat = markdownFile.stat;
    n.basename = markdownFile.basename;
    n.extension = markdownFile.extension;
    n.parentFolder = markdownFile.path.replace(markdownFile.name, '');
    n.listItems = [];
    if (metadata?.listItems) {
      n.listItems = metadata?.listItems.map(
        li =>
          new ListItem(
            li.parent,
            li.task ?? ' ',
            content.slice(li.position.start.offset, li.position.end.offset),
            li.position.start.line,
            li.position.start.col,
            n,
          ),
      );
    }

    n.links = metadata?.links ?? ([] as LinkCache[]);
    n.embeds = metadata?.embeds ?? ([] as EmbedCache[]);

    if (metadata?.tags) {
      n.tags = metadata?.tags.map(t => t.tag);
    } else if (metadata?.frontmatter?.tags) {
      n.tags = metadata?.frontmatter?.tags as string[];
    } else {
      n.tags = [];
    }

    n.headings = metadata?.headings ?? ([] as HeadingCache[]);
    n.sections = metadata?.sections ?? ([] as SectionCache[]);

    n.rawListItems = metadata?.listItems ?? ([] as ListItemCache[]);
    n.frontmatter = metadata?.frontmatter;

    n.blocks = metadata?.blocks ?? {};

    return n;
  }

  public path: string;
  public internalPath: string;
  public name: string;
  public stat: FileStats;
  public basename: string;
  public extension: string;
  public parentFolder: string;

  public links: LinkCache[];
  public embeds: EmbedCache[];
  public tags: string[];
  public headings: HeadingCache[];
  public sections: SectionCache[];
  public rawListItems: ListItemCache[];
  public listItems: ListItem[];
  public frontmatter: FrontMatterCache | undefined;
  public blocks: Record<string, BlockCache>;

  public content: string;
  /*
// >> id='docs-tables-obsidian-markdown-notes-linkcache' options=''

### LinkCache structure

```text
{
  link: string;
  original: string;
  // if title is different than link text, in the case of [[page name|display name]]
  displayText?: string;
  position: Pos;
}
```

### Pos structure

```text
Pos {
  start: Loc;
  end: Loc;
}
```

### Loc structure

```text
Loc {
  line: number;
  col: number;
  offset: number;
}
```
// << docs-tables-obsidian-markdown-notes-linkcache
*/
  /*
// >> id='docs-tables-obsidian-markdown-notes-embedcache' options=''

### EmbedCache structure

```text
{
  link: string;
  original: string;
  // if title is different than link text, in the case of [[page name|display name]]
  displayText?: string;
  position: Pos;
}
```
// << docs-tables-obsidian-markdown-notes-embedcache
*/

  /*
// >> id='docs-tables-obsidian-markdown-notes-headingcache' options=''
### HeadingCache structure

```text
{
  heading: string;
  level: number;
  position: Pos;
}
```
// << docs-tables-obsidian-markdown-notes-headingcache
*/
  /*
// >> id='docs-tables-obsidian-markdown-notes-sectioncache' options=''

### SectionCache structure

```text
{
  // The block ID of this section, if defined.
  id?: string | undefined;
  //The type string generated by the parser.
  type: string;
  position: Pos;
}
```

// << docs-tables-obsidian-markdown-notes-sectioncache
*/
  /*
// >> id='docs-tables-obsidian-markdown-notes-listitem' options=''

### ListItem structure

```text
{
    parent: number;
    task: string;
    checked: boolean;
    line: string;
}
```

// << docs-tables-obsidian-markdown-notes-listitem
*/
/*
// >> id='docs-tables-obsidian-markdown-notes-frontmattercache' options=''

### FrontMatterCache structure

```text
{
  [key: string]: any;
  position: Pos;
}
```
// << docs-tables-obsidian-markdown-notes-frontmattercache
*/
}

export class ListItem {
  private get listMatcher() {
    return /^([\s\t>]*)([-*+]|\d+\.)? *(\[(.)])? *(.*)/gm;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private _textMatch: RegExpExecArray | null = null;

  /**
   *
   */
  // eslint-disable-next-line max-params
  constructor(
    public parent: number,
    public task: string,
    public content: string,
    public line: number,
    public column: number,
    public note: Note,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  public get textMatch(): RegExpExecArray | null {
    if (this._textMatch === null) {
      this._textMatch = this.listMatcher.exec(this.content);
    }

    return this._textMatch;
  }

  public get isTopLevel(): boolean {
    return this.parent < 0;
  }

  public get page(): string {
    return this.note.path;
  }

  public get text(): string {
    if (this.textMatch !== null) {
      return this.textMatch[5];
    }

    return '';
  }

  public get checked(): boolean {
    if (this.textMatch !== null) {
      return this.textMatch[4] === 'x';
    }

    return false;
  }

  public get status(): string {
    if (this.textMatch !== null) {
      return this.textMatch[4];
    }

    return ' ';
  }

  public get treePath(): string {
    const path = '';
    // If the number is negative it is the root of a new potential tree. This
    // does not care about the entire list being collated together at this point.
    if (this.isTopLevel) {
      return `${Math.abs(this.line)}`;
    }

    const parentItem = this.note.listItems.find((value, ind, object) => Math.abs(value.line) === this.parent);

    return (parentItem?.treePath ?? '') + '.' + this.line.toString();
  }

  public get depth(): number {
    if (this.isTopLevel) {
      return 0;
    }

    const parentItem = this.note.listItems.find((value, ind, object) => Math.abs(value.line) === this.parent);
    return (parentItem?.depth ?? 0) + 1;
  }
}

export class NotesCacheService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.NotesCacheService');
  lastUpdate: DateTime;
  public notes: Note[] = [];

  public notesMap = new Map<string, Note>();
  public listItemsMap = new Map<string, ListItem>();

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
        const startTime = new Date(Date.now());
        await this.deleteNote(file.path);
        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    this.registerEvent(
      this.plugin.app.vault.on('rename', async (file, oldPath) => {
        this.logger.info(`rename event detected for ${file.path}`);
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
}
