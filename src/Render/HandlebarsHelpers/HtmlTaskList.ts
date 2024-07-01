import Handlebars from 'handlebars';
import {Component, MarkdownRenderer} from 'obsidian';

/*
// >> id='docs-handlebars-helper-htmltasklist' options='file=templates/hb-helpers/htmltasklist.md'
title: htmlTaskList
---
# {{ $frontmatter.title }}

The `htmlTaskList`-helper will ...

```handlebars
  {{htmlTaskList}}
```

when used with this context:

```json
{
  path: 'notepages/school/My Cool Page',
  name: 'My Cool Page is here!'
}
```

will result in:

````markdown
...
````

// << docs-handlebars-helper-htmltasklist
*/
/*
// >> id='docs-examples-handlebars-htmltasklist' options='file=examples-tutorials/handlebars/htmltasklist.md'
title: htmlTaskList Helper
---

This uses a simple query to help show what the `htmlTaskList`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{htmlTaskList 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{htmlTaskList 'text'}}
  {{/each}}
```

// << docs-examples-handlebars-htmltasklist
*/
export function htmlTaskList(value: any) {
  const ulOpen = '<ul class="contains-task-list has-list-bullet">';
  const ulClose = '</ul>';
  const liOpen = '<li class="task-list-item plugin-tasks-list-item">';
  const liClose = '</li>';
  let depth = 0;

  let listHtml = ulOpen;
  for (const taskItem of value) {
    if (taskItem.depth > depth) {
      listHtml += ulOpen;
      depth++;
    }

    if (taskItem.depth < depth) {
      listHtml += ulClose;
      depth--;
    }

    let checked = '';
    let classList = 'task-list-item-checkbox';
    let nextStatus = 'x';

    const currentStatus: string = taskItem.status as string;
    const text = taskItem.text as string;

    if (taskItem.status !== ' ') {
      checked = 'checked';
      classList += ' is-checked';
      nextStatus = ' ';
    }

    const content = document.createElement('span');

    const html = MarkdownRenderer.renderMarkdown(text, content, '', new Component()).then(() => content.innerHTML);

    listHtml += `${liOpen}<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${taskItem.page as string}',${taskItem.line as string},'${currentStatus}','${nextStatus}');"></input>`;
    listHtml += `${content.firstElementChild?.innerHTML ?? ' '}${liClose}`;
  }

  listHtml += ulClose;

  return new Handlebars.SafeString(listHtml);
}
