---
order: 11

parent: Data Tables
title: Obsidian Lists
---

# Obsidian Lists Table

Table Name: `obsidian_lists`

| Column Name | Type    | Description                                                                   |
| ----------- | ------- | ----------------------------------------------------------------------------- |
| parent      | number  | The ID of the parent list item, negative if at root of note and same as line. |
| task        | string  | Value between the square braces if the list item is a task.                   |
| content     | string  | The full content of the line including the list indicator ('-','*')           |
| line        | number  | The line that the list is found on the note.                                  |
| column      | number  | The column that the list item starts on.                                      |
| path        | string  | Path of the page the list item is on.                                         |
| modified    | number  | Time where parent note was last modified.                                     |
| heading     | string  | The heading that the task is under on the page.                               |
| note_name   | string  | The name of the not the task is located on.                                   |
| isTopLevel  | boolean | If true it is a top level list item and not nested.                           |
| text        | string  | The text part of the list minus the list indicator.                           |
| isTask      | boolean | If it has the braces for a markdown task this will be true.                   |
| checked     | boolean | If the tasks has a value between braces this is true.                         |
| status      | string  | Value between the square braces if the list item is a task.                   |