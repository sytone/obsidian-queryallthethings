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
  plugin = this.context(Plugin);

  public content: string;
  public path: string;
  public name: string;
  public stat: FileStats;
  public basename: string;
  public extension: string;
  public links: LinkCache[];
  public embeds: EmbedCache[];
  public tags: string[];
  public headings: HeadingCache[];
  public sections: SectionCache[];
  public rawListItems: ListItemCache[];
  public listItems: ListItem[];
  public frontmatter: FrontMatterCache | undefined;
  public blocks: Record<string, BlockCache>;

  constructor(
    public markdownFile: TFile,
    public metadata: CachedMetadata | undefined,
    private readonly context: Context,
  ) {
    if (!this.content) {
      this.plugin.app.vault
        .cachedRead(this.markdownFile)
        .then((content: string) => {
          this.content = content;
          if (this.metadata?.listItems) {
            this.listItems = this.metadata?.listItems.map(
              li =>
                new ListItem(
                  li.parent,
                  li.task ?? ' ',
                  li.task !== ' ',
                  this.content.slice(li.position.start.offset, li.position.end.offset),
                ),
            );
          }
        })
        .catch((error: Error) => {
          this.content = '';
        });
    }

    this.path = this.markdownFile.path;
    this.name = this.markdownFile.name;
    this.stat = this.markdownFile.stat;
    this.basename = this.markdownFile.basename;
    this.extension = this.markdownFile.extension;
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
    this.links = this.metadata?.links ?? ([] as LinkCache[]);

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
    this.embeds = this.metadata?.embeds ?? ([] as EmbedCache[]);

    if (this.metadata?.tags) {
      this.tags = this.metadata?.tags.map(t => t.tag);
    } else if (this.metadata?.frontmatter?.tags) {
      this.tags = this.metadata?.frontmatter?.tags as string[];
    } else {
      this.tags = [];
    }

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
    this.headings = this.metadata?.headings ?? ([] as HeadingCache[]);

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
    this.sections = this.metadata?.sections ?? ([] as SectionCache[]);

    this.rawListItems = this.metadata?.listItems ?? ([] as ListItemCache[]);

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
    this.listItems = [];

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
    this.frontmatter = this.metadata?.frontmatter;

    this.blocks = this.metadata?.blocks ?? {};
  }
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
      this.addNote(file.path, new Note(file, app.metadataCache.getFileCache(file) ?? undefined, this.use));
    }

    const endTime = new Date(Date.now());
    this.logger.info(`NotesCacheService Loaded ${this.notesMap.size} items in ${endTime.getTime() - startTime.getTime()}ms`);

    this.registerEvent(
      this.plugin.app.vault.on('create', file => {
        this.logger.info(`create event detected for ${file.path}`);
        const startTime = new Date(Date.now());
        const n = this.createNoteFromPath(file.path);
        if (n) {
          this.addNote(file.path, n);
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
      this.plugin.app.vault.on('delete', file => {
        this.logger.info(`delete event detected for ${file.path}`);
        const startTime = new Date(Date.now());
        this.deleteNote(file.path);
        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    this.registerEvent(
      this.plugin.app.vault.on('rename', (file, oldPath) => {
        this.logger.info(`rename event detected for ${file.path}`);
        const startTime = new Date(Date.now());
        const n = this.createNoteFromPath(file.path);
        if (n) {
          this.deleteNote(oldPath);
          this.addNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );

    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', (file, data, cache) => {
        this.logger.info(`metadataCache changed event detected for ${file.path}`);
        const startTime = new Date(Date.now());
        const n = this.createNoteFromFileAndCache(file, cache);
        if (n) {
          this.replaceNote(file.path, n);
        }

        this.plugin.app.workspace.trigger('qatt:notes-store-update');
        this.logger.info(`NotesCacheService Updated in ${new Date(Date.now()).getTime() - startTime.getTime()}ms`);
      }),
    );
  }

  getNotes(): Note[] {
    return Array.from(this.notesMap.values());
  }

  getNoteIndex(path: string): number {
    return this.notes.findIndex(n => n.markdownFile.path === path);
  }

  deleteNote(path: string) {
    this.notesMap.delete(path);
    // Old
    // const index = this.getNoteIndex(path);
    // if (index > -1) {
    //   this.notes.splice(index, 1);
    // }
  }

  replaceNote(path: string, note: Note) {
    this.notesMap.set(path, note);

    // Old
    // const index = this.getNoteIndex(path);
    // if (index > -1) {
    //   this.notes[index] = note;
    // }
  }

  addNote(path: string, note: Note) {
    this.notesMap.set(path, note);

    // Old
    // const index = this.getNoteIndex(path);
    // if (index > -1) {
    //   this.deleteNote(path);
    //   this.notes.push(note);
    // }
  }

  createNoteFromPath(path: string): Note | undefined {
    const f = this.plugin.app.vault
      .getMarkdownFiles()
      .find(f => f.path === path);
    if (f) {
      return new Note(
        f,
        this.plugin.app.metadataCache.getFileCache(f) ?? undefined,
        this.use,
      );
    }

    return undefined;
  }

  createNoteFromFile(file: TFile): Note | undefined {
    return new Note(
      file,
      this.plugin.app.metadataCache.getFileCache(file) ?? undefined,
      this.use,
    );
  }

  createNoteFromFileAndCache(file: TFile, cache: CachedMetadata): Note | undefined {
    return new Note(
      file,
      cache,
      this.use,
    );
  }
}
