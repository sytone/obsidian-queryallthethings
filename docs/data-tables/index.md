---
nav_order: 5
layout: default
title: Data Tables
has_children: true
---
To make it simpler to query data some in memory data tables have been created.

| Table Name              | Description                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [qatt.ReferenceCalendar](qatt-ReferenceCalendar.md)  | The reference calendar is used to help with date based management, you can directly query the table or use it to join to other data sources. |
| [obsidian_markdown_notes](obsidian-markdown-notes.md) | Uses a cached collection of the markdown notes with some properties made available at the top level of the note object as columns. |
| [obsidian_markdown_files](obsidian-markdown-files.md) | Uses in the inbuilt collection of markdown files, it calls `vault.getMarkdownFiles()` on every query to ensure the collection is up to date |
| [dataview_pages](dataview-pages.md)          | This is same as using pages as a data source in Dataview                                                                                    |
| [dataview_tasks](dataview-tasks.md)          | This is a in memory collection of tasks based off Dataview pages. Details below.                                                            |
| [dataview_lists](dataview-lists.md)          | This is a in memory collection of all list items including list items that contain task markdown based off DataView pages. Details Below    |
