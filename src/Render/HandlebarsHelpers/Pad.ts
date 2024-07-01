import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-pad' options='file=templates/hb-helpers/pad.md'
title: pad
---
# {{ $frontmatter.title }}

The `pad`-helper will pad a string with the specified character the specified number of times. By default the character is a space ' '.

```handlebars
  {{pad}}
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

// << docs-handlebars-helper-pad
*/
/*
// >> id='docs-examples-handlebars-pad' options='file=examples-tutorials/handlebars/pad.md'
title: pad Helper
---

This uses a simple query to help show what the pad helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{pad 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{pad 'text'}}
  {{/each}}
```

// << docs-examples-handlebars-pad
*/
export function pad(count: number, options: HelperOptions) {
  const fn = options.fn;
  const inverse = options.inverse;
  const paddingString = options.hash?.padWith as string ?? ' ';
  return new Handlebars.SafeString(paddingString.repeat((count)));
}
