---
order: 90

parent: Data Tables
title: Obsidian Markdown Notes
---
# Obsidian Markdown Notes (obsidian_markdown_notes)

Please use [obsidian_notes](../obsidian-notes) going forward, this table will be eventually removed.

If you need to reference a property of a object do not forget to use `->` and not `.`

| Column Name  | Type                                              | Description                                         |
| ------------ | ------------------------------------------------- | --------------------------------------------------- |
| content      | string                                            | Full content of the markdown note.                  |
| path         | string                                            | Full path to the markdown note.                     |
| internalPath | string                                            | Full path to the markdown note minus the extension. |
| name         | string                                            | The name of the note including the extension.       |
| parentFolder | string                                            | The path of the parent folder for this note.        |
| basename     | number                                            | Just the name of the note.                          |
| extension    | number                                            | The extension of the note. Usually `md`             |
| stat         | object                                            | contains the time and size details of the note.     |
| stat->ctime  | number                                            | Time the note was creates as a serial.              |
| stat->mtime  | number                                            | Time the note was last modified as a serial.        |
| stat->size   | number                                            | Size of the note in bytes                           |
| links        | [LinkCache[]](#linkcache-structure)               | Array of links cached by Obsidian                   |
| embeds       | [EmbedCache[]](#embedcache-structure)             | Array of embeds cached by Obsidian                  |
| tags         | string[]                                          | Array of tags cached by Obsidian                    |
| headings     | [HeadingCache[]](#headingcache-structure)         | Array of headings cached by Obsidian                |
| sections     | [SectionCache[]](#sectioncache-structure)         | Array of sections cached by Obsidian                |
| listItems    | [ListItem[]](#listcache-structure)                | Array of listItems cached by Obsidian               |
| frontmatter  | [FrontMatterCache[]](#frontmattercache-structure) | Array of frontmatter cached by Obsidian             |
| blocks       | Record<string, BlockCache>                        | Array of blocks cached by Obsidian                  |

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

## ListItem structure

```text
{
    parent: number;
    task: string;
    checked: boolean;
    line: string;
}
```

## FrontMatterCache structure

```text
{
  [key: string]: any;
  position: Pos;
}
```