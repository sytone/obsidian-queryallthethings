---
order: 12

parent: Data Tables
title: Obsidian Tasks
---

# Obsidian Tasks Table

Table Name: `obsidian_tasks`

| Column Name    | Type     | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| path           | string   | Full path to the note the task is located on.                     |
| note_name      | string   | The name of the not the task is located on.                       |
| modified       | number   | Time where parent note was last modified.                         |
| task           | string   | The value of the character between the braces for the checkbox.   |
| status         | string   | The value of the character between the braces for the checkbox.   |
| content        | string   | The full tasks string with no parsing or stripping of characters. |
| text           | string   | The text only part of the task, without list and checkbox prefix. |
| line           | number   | The line number the task can be found on for the page.            |
| heading        | string   | The heading that the task is under on the page.                   |
| tags           | string[] | Collection of tags.                                               |
| tagsNormalized | string[] | Collection of tags that have been converted to lowercase.         |
| dueDate        | string   | When the task is due ['📅', 'due::']                               |
| doneDate       | string   | When the task is done ['✅', 'completion::']                       |
| startDate      | string   | When the task can be started ['🛫', 'start::']                     |
| createDate     | string   | When the task is created ['➕', 'created::']                       |
| scheduledDate  | string   | When the task is scheduled next ['⏳', 'scheduled::']              |
| doDate         | string   | When to do the task ['💨', 'do::']                                 |
| priority       | number   | Priority of task based on indicator ['⏫🔼🔽', 'priority::']         |
| cleanTask      | string   | The task string with all metadata removed.                        |
| blockLink      | string   | manually specified block Link for the task                        |
