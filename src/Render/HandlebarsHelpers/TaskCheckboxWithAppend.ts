import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-taskcheckboxwithappend' options='file=templates/hb-helpers/taskcheckboxwithappend.md'
title: taskCheckboxWithAppend
---
# {{ $frontmatter.title }}

The `taskCheckboxWithAppend`-helper will ...

```handlebars
  {{taskCheckboxWithAppend}}
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

// << docs-handlebars-helper-taskcheckboxwithappend
*/
/*
// >> id='docs-examples-handlebars-taskcheckboxwithappend' options='file=examples-tutorials/handlebars/taskcheckboxwithappend.md'
title: taskCheckboxWithAppend Helper
---

This uses a simple query to help show what the `taskCheckboxWithAppend`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckboxWithAppend 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckboxWithAppend 'text'}}
  {{/each}}
```

// << docs-examples-handlebars-taskcheckboxwithappend
*/
export function taskCheckboxWithAppend(value: any) {
  let checked = '';
  let classList = 'task-list-item-checkbox';
  let nextStatus = 'x';
  const currentStatus: string = value.status as string;
  const appendValue: string = value.append as string;

  if (value.status !== ' ') {
    checked = 'checked';
    classList += ' is-checked';
    nextStatus = ' ';
  }

  const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="console.log(this.checked); qattUpdateOriginalTaskWithAppend('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}','${appendValue}');"></input>`;
  return new Handlebars.SafeString(checkBoxHtml);
}
