---
nav_order: 4
layout: default
parent: Data Tables
title: Obsidian Markdown Lists
---

## Obsidian Markdown Lists (obsidian_markdown_lists)

The list item is parse by the following regular expression to extract information about it, if you encounter issues you can use this to help debug.

`/^([\s\t>]*)([-*+]|\d+\.)? *(\[(.)])? *(.*)/gm`

| Column Name | Type    | Description                           |
| ----------- | ------- | ------------------------------------- |
| parent      | number  |                                       |
| task        | string  |                                       |
| content     | string  |                                       |
| line        | number  |                                       |
| column      | number  |                                       |
| note        | Note    | Note object                           |
| isTopLevel  | boolean |                                       |
| page        | string  | Path of the page the list item is on. |
| text        | string  | The text part of the list.            |
| checked     | boolean |                                       |
| status      | string  |                                       |
| treePath    | string  |                                       |
| depth       | number  |                                       |

%%This file is auto-generated. Do not edit. Generated at: Thu Mar 14 2024%%