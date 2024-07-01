import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-flexibletaskcheckbox' options='file=templates/hb-helpers/flexibletaskcheckbox.md'
title: flexibleTaskCheckbox
---
# {{ $frontmatter.title }}

The `flexibleTaskCheckbox`-helper will ...

```handlebars
  {{flexibleTaskCheckbox}}
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

// << docs-handlebars-helper-flexibletaskcheckbox
*/
/*
// >> id='docs-examples-handlebars-flexibletaskcheckbox' options='file=examples-tutorials/handlebars/flexibletaskcheckbox.md'
title: flexibleTaskCheckbox Helper
---

This uses a simple query to help show what the `flexibleTaskCheckbox`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{flexibleTaskCheckbox 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{flexibleTaskCheckbox 'text'}}
  {{/each}}
```

// << docs-examples-handlebars-flexibletaskcheckbox
*/
export function flexibleTaskCheckbox(value: any, options: HelperOptions) {
  const fn = options.fn;
  const inverse = options.inverse;
  const callback: string = options.hash?.callback as string ?? 'qattUpdateOriginalTask';
  let nextStatus: string = options.hash?.nextStatus as string ?? 'x';
  let classList: string = options.hash?.classList as string ?? 'task-list-item-checkbox';
  const log: boolean = options.hash?.log as boolean ?? false;
  const currentStatus: string = value.status as string;
  const appendValue: string = value.append as string;
  let checked = '';

  if (value.status !== ' ') {
    checked = 'checked';
    classList += ' is-checked';
    nextStatus = ' ';
  }

  const checkBoxHtml = `<input class="${classList}" type="checkbox" ${checked} data-task="${currentStatus}" onclick="${log ? 'console.log(this.checked); ' : ''}${callback}('${value.page as string}',${value.line as string},'${currentStatus}','${nextStatus}','${appendValue}');"></input>`;
  return new Handlebars.SafeString(checkBoxHtml);
}
