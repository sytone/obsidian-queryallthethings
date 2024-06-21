import {type Note} from 'Note';

/*
// >> id='docs-tables-obsidian-markdown-lists' options='file=data-tables/obsidian-markdown-lists.md'
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
| isTopLevel  | boolean |                                       |
| path        | string  | Path of the page the list item is on. |
| modified    | number  | Time where parent note was last modified. |
| text        | string  | The text part of the list.            |
| checked     | boolean |                                       |
| status      | string  |                                       |

// << docs-tables-obsidian-markdown-lists
*/

export class ListItem {
  public readonly _textMatch: RegExpExecArray | null = this.listMatcher.exec(this.content); // eslint-disable-line @typescript-eslint/ban-types

  public isTopLevel: boolean = this.parent < 0;
  public page: string = this.path;
  public text: string = this._textMatch === null ? '' : this._textMatch[5];
  public isTask: boolean = this._textMatch === null ? false : this._textMatch[4] !== undefined;
  public checked: boolean = this._textMatch === null ? false : this._textMatch[4] !== undefined;
  public status: string = this._textMatch === null ? ' ' : this._textMatch[4];

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
