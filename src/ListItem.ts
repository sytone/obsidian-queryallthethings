import {type Note} from 'Note';

/*
// >> id='docs-tables-obsidian-lists' options='file=data-tables/obsidian-lists.md'
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

// << docs-tables-obsidian-lists
*/

export class ListItem {
  public readonly _textMatch: RegExpExecArray | null = this.listMatcher.exec(this.content); // eslint-disable-line @typescript-eslint/ban-types

  public isTopLevel: boolean = this.parent < 0;
  public page: string = this.path;
  public text: string = this._textMatch === null ? '' : this._textMatch[5];
  public isTask: boolean = this._textMatch === null ? false : this._textMatch[4] !== undefined;
  public checked: boolean = this._textMatch === null ? false : this._textMatch[4] !== undefined;
  public status: string = this.isTask && this._textMatch !== null ? this._textMatch[4] : '';

  private get listMatcher() {
    return /^([\s\t>]*)([-*+]|\d+\.)? *(\[(.)])? *(.*)/gm;
  }

  /**
   * Represents a ListItem object.
   */
  // eslint-disable-next-line max-params
  constructor(
    public parent: number,
    public task: string,
    public content: string,
    public line: number,
    public column: number,
    public path: string,
    public modified: number,
    public heading: string,
    public note_name: string,
  ) {}

  // Removing to deal with recursion issues.
  // public get treePath(): string {
  //   const path = '';
  //   // If the number is negative it is the root of a new potential tree. This
  //   // does not care about the entire list being collated together at this point.
  //   if (this.isTopLevel) {
  //     return `${Math.abs(this.line)}`;
  //   }

  //   const parentItem = this.note.listItems.find((value, ind, object) => Math.abs(value.line) === this.parent);

  //   return (parentItem?.treePath ?? '') + '.' + this.line.toString();
  // }

  // public get depth(): number {
  //   if (this.isTopLevel) {
  //     return 0;
  //   }

  //   const parentItem = this.note.listItems.find((value, ind, object) => Math.abs(value.line) === this.parent);
  //   return (parentItem?.depth ?? 0) + 1;
  // }
}
