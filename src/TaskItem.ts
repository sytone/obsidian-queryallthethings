import {type ListItem} from 'ListItem';
import {type Note} from 'Note';
import {parseTask} from 'Parse/Parsers';

/*
// >> id='docs-tables-obsidian-markdown-tasks' options='file=data-tables/obsidian-markdown-tasks.md'
---
nav_order: 5
layout: default
parent: Data Tables
title: Obsidian Markdown Tasks (obsidian_markdown_tasks)
---

## Obsidian Markdown Tasks (obsidian_markdown_tasks)

| Column Name    | Type     | Description |
| -------------- | -------- | ----------- |
| page           | string   |             |
| task           | string   |             |
| status         | string   |             |
| content        | string   |             |
| text           | string   |             |
| line           | number   |             |
| tags           | string[] |             |
| tagsNormalized | string[] |             |
| dueDate        | string   |             |
| doneDate       | string   |             |
| startDate      | string   |             |
| createDate     | string   |             |
| scheduledDate  | string   |             |
| priority       | number   |             |

// << docs-tables-obsidian-markdown-tasks
*/

export class TaskItem {
  public readonly page;
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
  public readonly priority;
  private readonly _parsedTask;

  constructor(
    public listItem: ListItem,
  ) {
    this._parsedTask = parseTask(listItem.content);
    this.page = this.listItem.page;
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
    this.priority = this._parsedTask.priority;
  }
}
