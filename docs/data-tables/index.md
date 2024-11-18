---
order: 7

title: Data Tables
has_children: true
---
To make it simpler to query data some in memory data tables have been created.

| Table Name                                       | Description                                                                                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [qatt.ReferenceCalendar](qatt-referencecalendar) | The reference calendar is used to help with date based management, you can directly query the table or use it to join to other data sources. |
| [obsidian_notes](obsidian-notes)                 | Uses a cached collection of the markdown notes with some properties made available at the top level of the note object as columns.           |
| [obsidian_lists](obsidian-lists)                 | Uses a cached collection of all list items from all notes in the vault.                                                                      |
| [obsidian_tasks](obsidian-tasks)                 | Uses a cached collection of all task items from all notes in the vault.                                                                      |
| [PAGEPROPERTY](pageproperty)                     | Allows a query to work against a page property that is a collection like `tags`                                                              |
| [dataview_pages](dataview/dataview-pages)        | This is same as using pages as a data source in Dataview                                                                                     |
| [dataview_tasks](dataview/dataview-tasks)        | This is a in memory collection of tasks based off Dataview pages. Details below.                                                             |
| [dataview_lists](dataview/dataview-lists)        | This is a in memory collection of all list items including list items that contain task markdown based off DataView pages. Details Below     |
