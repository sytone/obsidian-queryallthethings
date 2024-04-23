import {type ListItem} from 'ListItem';
import {parseDataViewProperty, parseTask} from 'Parse/Parsers';

/*
// >> id='docs-tables-obsidian-markdown-tasks' options='file=data-tables/obsidian-markdown-tasks.md'
---
nav_order: 5
layout: default
parent: Data Tables
title: Obsidian Markdown Tasks
---

## Obsidian Markdown Tasks (obsidian_markdown_tasks)

| Column Name    | Type     | Description |
| -------------- | -------- | ----------- |
| path           | string   | Full path to the page the task is located on.            |
| modified       | number  | Time where parent note was last modified. |
| task           | string   |             |
| status         | string   | The value of the character between the braces for the checkbox.            |
| content        | string   | The full tasks string with no parsing or stripping of characters.            |
| text           | string   | The text only part of the task, without list and checkbox prefix.            |
| line           | number   | The line number the task can be found on for the page.            |
| tags           | string[] | Collection of tags.            |
| tagsNormalized | string[] | Collection of tags that have been converted to lowercase.            |
| dueDate        | string   | When the task is due ['📅', 'due::']             |
| doneDate       | string   | When the task is done ['✅', 'completion::']            |
| startDate      | string   | When the task can be started ['🛫', 'start::']            |
| createDate     | string   | When the task is created ['➕', 'created::']          |
| scheduledDate  | string   | When the task is scheduled next ['⏳', 'scheduled::']           |
| doDate         | string   | When to do the task ['💨', 'do::']           |
| priority       | number   | Priority of task based on indicator ['⏫🔼🔽', 'priority::']             |
| cleanTask      | string   | The task string with all metadata removed.            |

// << docs-tables-obsidian-markdown-tasks
*/

export class TaskItem {
  public readonly page;
  public readonly path;
  public readonly modified;
  public readonly task;
  public readonly status;
  public readonly content;
  public readonly text;
  public readonly line;
  public readonly tags;
  public readonly tagsNormalized;
  public readonly dueDate;
  public readonly doneDate;
  public readonly startDate;
  public readonly createDate;
  public readonly scheduledDate;
  public readonly doDate;
  public readonly priority;
  public readonly cleanTask: string;
  private readonly _parsedTask;

  constructor(
    public listItem: ListItem,
    public enableDataViewInlineFieldParsing: boolean = false,
  ) {
    this._parsedTask = parseTask(listItem.content);
    this.page = this.listItem.page;
    this.path = this.listItem.page;
    this.modified = this.listItem.modified;
    this.task = this.listItem.task;
    this.content = this.listItem.content;
    this.text = this.listItem.text;
    this.status = this.listItem.status;
    this.line = this.listItem.line;
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

    if (this.enableDataViewInlineFieldParsing) {
      this.cleanTask = parseDataViewProperty(this);
    }

    this.cleanTask = this.cleanTask.trim();
  }
}
