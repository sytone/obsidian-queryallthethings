import {
  type TFile,
  type CachedMetadata,
  type LinkCache,
  type EmbedCache,
  type HeadingCache,
  type SectionCache,
  type ListItemCache,
  type FrontMatterCache,
  type BlockCache,
  type FileStats,
} from 'obsidian';
import {ListItem} from 'ListItem';

/*
Update the table below when new columns are added so documentation is updated.
// >> id='docs-tables-obsidian-markdown-notes' options='file=data-tables/obsidian-markdown-notes.md'
---
nav_order: 2
layout: default
parent: Data Tables
title: Obsidian Markdown Notes
---
## Obsidian Markdown Notes (obsidian_markdown_notes)

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

### HeadingCache structure

```text
{
  heading: string;
  level: number;
  position: Pos;
}
```

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

### ListItem structure

```text
{
    parent: number;
    task: string;
    checked: boolean;
    line: string;
}
```

### FrontMatterCache structure

```text
{
  [key: string]: any;
  position: Pos;
}
```
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
        li => new ListItem(
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
}
