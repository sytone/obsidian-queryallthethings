import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-taskcheckbox' options='file=templates/hb-helpers/taskcheckbox.md'
title: taskCheckbox
---
# {{ $frontmatter.title }}

The `taskCheckbox`-helper will ...

```handlebars
  {{taskCheckbox}}
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

// << docs-handlebars-helper-taskcheckbox
*/
/*
// >> id='docs-examples-handlebars-taskcheckbox' options='file=examples-tutorials/handlebars/taskcheckbox.md'
title: taskCheckbox Helper
---

This uses a simple query to help show what the `taskCheckbox`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckbox 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckbox 'text'}}
  {{/each}}
```

// << docs-examples-handlebars-taskcheckbox
*/
export function taskCheckbox(value: any) {
  let checked = '';
  let classList = 'task-list-item-checkbox';
  let nextStatus = 'x';
  const currentStatus: string = value.status as string;

  if (value.status !== ' ') {
    checked = 'checked';
    classList += ' is-checked';
    nextStatus = ' ';
  }

  const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTask('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}');"></input>`;
  return new Handlebars.SafeString(checkBoxHtml);
}
