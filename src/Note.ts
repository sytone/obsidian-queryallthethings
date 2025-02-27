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
import { ListItem } from 'ListItem';
import { TaskItem } from 'TaskItem';

/*
Update the table below when new columns are added so documentation is updated.
// >> id='docs-tables-obsidian-notes' options='file=data-tables/obsidian-notes.md'
---
order: 10
parent: Data Tables
title: Obsidian Notes
---

# Obsidian Notes Table

Table Name: `obsidian_notes`

If you need to reference a property of a object do not forget to use `->` and not `.`

| Column Name  | Type                                              | Description                                                  |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| path         | string                                            | Full path to the markdown note                               |
| name         | string                                            | The name of the note including the extension                 |
| content      | string                                            | The raw content of the markdown file                         |
| internalPath | string                                            | Full path to the markdown note minus the extension           |
| parentFolder | string                                            | The path of the parent folder for this note                  |
| basename     | number                                            | Just the name of the note                                    |
| extension    | number                                            | The extension of the note. Usually `md`                      |
| stat         | object                                            | contains the time and size details of the note               |
| created      | number                                            | Time the note was creates as a serial                        |
| modified     | number                                            | Time the note was last modified as a serial                  |
| size         | number                                            | Size of the note in bytes                                    |
| links        | [LinkCache[]](#linkcache-structure)               | Array of links cached by Obsidian                            |
| embeds       | [EmbedCache[]](#embedcache-structure)             | Array of embeds cached by Obsidian                           |
| tags         | string[]                                          | Array of tags cached by Obsidian                             |
| headings     | [HeadingCache[]](#headingcache-structure)         | Array of headings cached by Obsidian                         |
| sections     | [SectionCache[]](#sectioncache-structure)         | Array of sections cached by Obsidian                         |
| frontmatter  | [FrontMatterCache[]](#frontmattercache-structure) | Array of frontmatter cached by Obsidian                      |
| blocks       | Record<string, BlockCache>                        | Array of blocks cached by Obsidian                           |
| listItems    | object                                            | See the obsidian_lists table for the structure of the object |
| tasks        | object                                            | See the obsidian_tasks table for the structure of the object |

## LinkCache structure

```text
{
  link: string;
  original: string;
  // if title is different than link text, in the case of [[page name|display name]]
  displayText?: string;
  position: Pos;
}
```

## Pos structure

```text
Pos {
  start: Loc;
  end: Loc;
}
```

## Loc structure

```text
Loc {
  line: number;
  col: number;
  offset: number;
}
```

## EmbedCache structure

```text
{
  link: string;
  original: string;
  // if title is different than link text, in the case of [[page name|display name]]
  displayText?: string;
  position: Pos;
}
```

## HeadingCache structure

```text
{
  heading: string;
  level: number;
  position: Pos;
}
```

## SectionCache structure

```text
{
  // The block ID of this section, if defined.
  id?: string | undefined;
  //The type string generated by the parser.
  type: string;
  position: Pos;
}
```

## FrontMatterCache structure

```text
{
  [key: string]: any;
  position: Pos;
}
```
// << docs-tables-obsidian-notes
*/

export class Note {
  public static async createNewNote (markdownFile: TFile,
    metadata: CachedMetadata | undefined,
    content: string,
  ): Promise<Note> {
    const n = new Note();
    n.content = content; // Old content;
    n.path = markdownFile.path;
    n.name = markdownFile.name;
    n.internalPath = markdownFile.path.replace(`.${markdownFile.extension}`, '');
    n.parentFolder = markdownFile.path.replace(markdownFile.name, '');
    n.basename = markdownFile.basename;
    n.extension = markdownFile.extension;

    n.stat = markdownFile.stat;
    n.created = markdownFile.stat.ctime;
    n.modified = markdownFile.stat.mtime;
    n.size = markdownFile.stat.size;

    n.links = metadata?.links ?? ([] as LinkCache[]);
    n.embeds = metadata?.embeds ?? ([] as EmbedCache[]);

    if (metadata?.tags) {
      n.tags = metadata?.tags.map(t => t.tag);
    } else if (metadata?.frontmatter?.tags) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      n.tags = metadata?.frontmatter?.tags.constructor === Array ? metadata?.frontmatter?.tags as string[] : [metadata?.frontmatter?.tags];
    } else {
      n.tags = [];
    }

    n.headings = metadata?.headings ?? ([] as HeadingCache[]);
    n.sections = metadata?.sections ?? ([] as SectionCache[]);
    n.frontmatter = metadata?.frontmatter;
    n.blocks = metadata?.blocks ?? {};

    n.listItems = [];
    n.tasks = [];

    if (metadata?.listItems) {
      n.listItems = metadata?.listItems.map(
        li => new ListItem(
          li.parent,
          li.task ?? ' ',
          content.slice(li.position.start.offset, li.position.end.offset),
          li.position.start.line,
          li.position.start.col,
          markdownFile.path,
          markdownFile.stat.mtime,
          // Find the nearest heading to the list item using metadata.headings
          metadata?.headings?.reduce(
            (closest, heading) => {
              if (heading.position.start.line <= li.position.start.line && heading.position.start.line > closest.position.start.line) {
                return heading;
              }

              return closest;
            }, { heading: '', position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }).heading ?? '',
          markdownFile.basename,
        ));
      n.tasks = n.listItems.filter(li => li.isTask).map(li => {
        const newTask = new TaskItem();
        return newTask.updateTaskItem(li, true);
      });
    }

    const newTask = new TaskItem();

    n.rawListItems = metadata?.listItems ?? ([] as ListItemCache[]);

    return n;
  }

  public content: string;
  public path: string;
  public internalPath: string;
  public name: string;
  public parentFolder: string;
  public basename: string;
  public extension: string;
  public stat: FileStats;
  public listItems: ListItem[];
  public tasks: TaskItem[];
  public frontmatter: FrontMatterCache | undefined;
  public blocks: Record<string, BlockCache>;
  public links: LinkCache[];
  public embeds: EmbedCache[];
  public tags: string[];
  public headings: HeadingCache[];
  public sections: SectionCache[];

  public created: number;
  public modified: number;
  public size: number;

  private rawListItems: ListItemCache[];
}
