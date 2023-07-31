
import {Plugin,
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
  type FileStats} from 'obsidian';
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

  private _content: string;

  constructor(public markdownFile: TFile, public metadata: CachedMetadata | undefined, private readonly context: Context) {
    this.getCachedContent(this.markdownFile);
  }

  // Only loading up the content if needed and once, this is async so there is a potential race
  // condition here, but I don't think it will be an issue immediately. Something to fix
  // in the future.
  getCachedContent(file: TFile): string {
    if (!this._content) {
      this.plugin.app.vault.cachedRead(this.markdownFile).then((content: string) => {
        this._content = content;
      }).catch((error: Error) => {
        this._content = '';
      });
    }

    return this._content;
  }

  public get content(): string {
    return this.getCachedContent(this.markdownFile);
  }

  public get path(): string {
    return this.markdownFile.path;
  }

  public get name(): string {
    return this.markdownFile.name;
  }

  public get stat(): FileStats {
    return this.markdownFile.stat;
  }

  public get basename(): string {
    return this.markdownFile.basename;
  }

  public get extension(): string {
    return this.markdownFile.extension;
  }

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
  public get links(): LinkCache[] {
    return this.metadata?.links ?? [] as LinkCache[];
  }

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
  public get embeds(): EmbedCache[] {
    return this.metadata?.embeds ?? [] as EmbedCache[];
  }

  public get tags(): string[] {
    if (this.metadata?.tags) {
      return this.metadata?.tags.map(t => t.tag);
    }

    if (this.metadata?.frontmatter?.tags) {
      return this.metadata?.frontmatter?.tags as string[];
    }

    return [];
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
  public get headings(): HeadingCache[] {
    return this.metadata?.headings ?? [] as HeadingCache[];
  }

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
  public get sections(): SectionCache[] {
    return this.metadata?.sections ?? [] as SectionCache[];
  }

  public get rawListItems(): ListItemCache[] {
    return this.metadata?.listItems ?? [] as ListItemCache[];
  }

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
  public get listItems(): ListItem[] {
    let listItems: ListItem[] = [];

    if (this.metadata?.listItems) {
      listItems = this.metadata?.listItems.map(li => new ListItem(
        li.parent,
        li.task ?? ' ',
        li.task !== ' ',
        this.content.slice(li.position.start.offset, li.position.end.offset),
      ));
    }

    return listItems;
  }

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
  public get frontmatter(): FrontMatterCache | undefined {
    return this.metadata?.frontmatter;
  }

  public get blocks(): Record<string, BlockCache> {
    return this.metadata?.blocks ?? {};
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

  constructor() {
    super();
    this.lastUpdate = DateTime.now();
  }

  async onload() {
    this.logger.info(`NotesCacheService Last Update: ${this.lastUpdate.toISO() ?? ''}`);
    const startTime = new Date(Date.now());

    this.notes = this.plugin.app.vault.getMarkdownFiles().map((file: TFile) => new Note(file, this.plugin.app.metadataCache.getFileCache(file) ?? undefined, this.use));
    const endTime = new Date(Date.now());
    this.logger.info(`NotesCacheService Loaded ${this.notes.length} items in ${endTime.getTime() - startTime.getTime()}ms`);

    this.registerEvent(this.plugin.app.vault.on('create', file => {
      this.logger.info(`create event detected for ${file.path}`);
      const startTime = new Date(Date.now());
      const createdFile = this.plugin.app.vault.getMarkdownFiles().find(f => f.path === file.path);
      if (createdFile) {
        this.notes.push(new Note(createdFile, this.plugin.app.metadataCache.getFileCache(createdFile) ?? undefined, this.use));
      }

      this.plugin.app.workspace.trigger('qatt:notes-store-update');
      this.logger.info(`NotesCacheService Updated in ${(new Date(Date.now())).getTime() - startTime.getTime()}ms`);
    }));

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

    this.registerEvent(this.plugin.app.vault.on('delete', file => {
      this.logger.info(`delete event detected for ${file.path}`);
      const startTime = new Date(Date.now());
      const deletedFile = this.notes.find(n => n.markdownFile.path === file.path);
      if (deletedFile) {
        this.notes.remove(deletedFile);
      }

      this.plugin.app.workspace.trigger('qatt:notes-store-update');
      this.logger.info(`NotesCacheService Updated in ${(new Date(Date.now())).getTime() - startTime.getTime()}ms`);
    }));

    this.registerEvent(this.plugin.app.vault.on('rename', (file, oldPath) => {
      this.logger.info(`rename event detected for ${file.path}`);
      const startTime = new Date(Date.now());
      const renamedFile = this.plugin.app.vault.getMarkdownFiles().find(f => f.path === file.path);
      const oldFile = this.notes.find(n => n.markdownFile.path === oldPath);
      if (oldFile) {
        this.notes.remove(oldFile);
      }

      if (renamedFile) {
        this.notes.push(new Note(renamedFile, this.plugin.app.metadataCache.getFileCache(renamedFile) ?? undefined, this.use));
      }

      this.plugin.app.workspace.trigger('qatt:notes-store-update');
      this.logger.info(`NotesCacheService Updated in ${(new Date(Date.now())).getTime() - startTime.getTime()}ms`);
    }));

    this.registerEvent(this.plugin.app.metadataCache.on('changed', (file, data, cache) => {
      this.logger.info(`metadataCache changed event detected for ${file.path}`);
      const startTime = new Date(Date.now());
      const modifiedFile = this.plugin.app.vault.getMarkdownFiles().find(f => f.path === file.path);
      const fileIndex = this.notes.findIndex(n => n.markdownFile.path === file.path);
      if (fileIndex !== -1 && modifiedFile) {
        this.notes[fileIndex].metadata = cache;
        this.notes[fileIndex].markdownFile = modifiedFile;
      }

      this.plugin.app.workspace.trigger('qatt:notes-store-update');
      this.logger.info(`NotesCacheService Updated in ${(new Date(Date.now())).getTime() - startTime.getTime()}ms`);
    }));
  }
}
