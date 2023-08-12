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
// >> docs-tables-obsidian-markdown-notes

If you need to reference a property of a object do not forget to use `->` and not `.`

| Column Name | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| content        | string | Full content of the markdown note.                |
| path        | string | Full path to the markdown note.                 |
| name        | string | The name of the note including the extension.   |
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
    n.stat = markdownFile.stat;
    n.basename = markdownFile.basename;
    n.extension = markdownFile.extension;
    n.parentFolder = markdownFile.path.replace(markdownFile.name, '');

    if (metadata?.listItems) {
      n.listItems = metadata?.listItems.map(
        li =>
          new ListItem(
            li.parent,
            li.task ?? ' ',
            li.task !== ' ',
            content.slice(li.position.start.offset, li.position.end.offset),
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
    n.listItems = [];
    n.frontmatter = metadata?.frontmatter;

    n.blocks = metadata?.blocks ?? {};

    return n;
  }

  public path: string;
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
  // >> docs-tables-obsidian-markdown-notes-linkcache
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
  // >> docs-tables-obsidian-markdown-notes-embedcache
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
  // >> docs-tables-obsidian-markdown-notes-headingcache
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
  // >> docs-tables-obsidian-markdown-notes-sectioncache

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
  // >> docs-tables-obsidian-markdown-notes-listitem

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
  // >> docs-tables-obsidian-markdown-notes-frontmattercache

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
  /**
   *
   */
  constructor(
    public parent: number,
    public task: string,
    public checked: boolean,
    public line: string,
  ) {}
}

export class NotesCacheService extends Service {
  plugin = this.use(Plugin);
  logger = this.use(LoggingService).getLogger('Qatt.NotesCacheService');
  lastUpdate: DateTime;
  public notes: Note[] = [];

  public notesMap = new Map<string, Note>();

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

  async getNoteIndex(path: string): Promise<number> {
    return this.notes.findIndex(n => n.path === path);
  }

  async deleteNote(path: string) {
    this.notesMap.delete(path);
  }

  async replaceNote(path: string, note: Note) {
    this.notesMap.set(path, note);
  }

  async addNote(path: string, note: Note) {
    this.notesMap.set(path, note);
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
