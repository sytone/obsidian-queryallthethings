/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {type ListItem} from 'ListItem';
import {parseDataViewProperty, parseTask} from 'Parse/Parsers';

/*
// >> id='docs-tables-obsidian-tasks' options='file=data-tables/obsidian-tasks.md'
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
| blockLink      | string   | Manually specified block Link for the task                        |

// << docs-tables-obsidian-tasks
*/

export class TaskItem {
  public page: string;
  public path: string;
  public note_name: string;
  public modified: number;
  public task: string;
  public status: string;
  public content: string;
  public text: string;
  public line: number;
  public heading: string;
  public tags: string[];
  public tagsNormalized: string[];
  public dueDate: string;
  public doneDate: string;
  public startDate: string;
  public createDate: string;
  public scheduledDate: string;
  public doDate: string;
  public priority: number;
  public cleanTask: string;
  public blockLink: string;
  public listItem: ListItem;

  private _parsedTask: any;

  public updateTaskItem(listItem: ListItem, enableDataViewInlineFieldParsing = false) {
    this._parsedTask = parseTask(listItem.content);

    this.tags = this._parsedTask.tags;
    this.tagsNormalized = this._parsedTask.tagsNormalized;
    this.dueDate = this._parsedTask.dueDate;
    this.doneDate = this._parsedTask.doneDate;
    this.startDate = this._parsedTask.startDate;
    this.createDate = this._parsedTask.createDate;
    this.scheduledDate = this._parsedTask.scheduledDate;
    this.doDate = this._parsedTask.doDate;
    this.priority = this._parsedTask.priority;
    this.cleanTask = this._parsedTask.cleanTask;
    this.blockLink = this._parsedTask.blockLink;

    this.page = listItem.path;
    this.path = listItem.path;
    this.note_name = listItem.note_name;
    this.modified = listItem.modified;
    this.task = listItem.task;
    this.content = listItem.content;
    this.text = listItem.text;
    this.status = listItem.status;
    this.line = listItem.line;
    this.heading = listItem.heading;

    if (enableDataViewInlineFieldParsing) {
      this.cleanTask = parseDataViewProperty(this);
    }

    this.cleanTask = this.cleanTask.trim();

    return this;
  }
}
