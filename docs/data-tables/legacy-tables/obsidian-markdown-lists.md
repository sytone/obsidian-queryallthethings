---
order: 91

parent: Data Tables
title: Obsidian Markdown Lists
---

## Obsidian Markdown Lists (obsidian_markdown_lists)

Please use [obsidian_lists](../obsidian-lists) going forward, this table will be eventually removed.

The list item is parse by the following regular expression to extract information about it, if you encounter issues you can use this to help debug.

`/^([\s\t>]*)([-*+]|\d+\.)? *(\[(.)])? *(.*)/gm`

| Column Name | Type    | Description                               |
| ----------- | ------- | ----------------------------------------- |
| parent      | number  |                                           |
| task        | string  |                                           |
| content     | string  |                                           |
| line        | number  |                                           |
| column      | number  |                                           |
| isTopLevel  | boolean |                                           |
| path        | string  | Path of the page the list item is on.     |
| modified    | number  | Time where parent note was last modified. |
| text        | string  | The text part of the list.                |
| checked     | boolean |                                           |
| status      | string  |                                           |
