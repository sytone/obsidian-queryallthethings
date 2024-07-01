---
order: 100

parent: Data Tables
title: RETIRED - Obsidian Markdown Files
---
## Obsidian Markdown Files (obsidian_markdown_files)

This has been retired, please use obsidian_notes instead.

If you need to reference a property of a object do not forget to use `->` and not `.`

| Column Name | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| path        | string | Full path to the markdown file.                 |
| name        | string | The name of the file including the extension.   |
| basename    | number | Just the name of the file.                      |
| extension   | number | The extension of the file. Usually `md`         |
| stat        | object | contains the time and size details of the file. |
| stat->ctime | number | Time the file was creates as a serial.          |
| stat->mtime | number | Time the file was last modified as a serial.    |
| stat->size  | number | Size of the file in bytes                       |