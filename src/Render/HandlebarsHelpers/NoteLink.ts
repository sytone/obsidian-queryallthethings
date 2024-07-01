import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-notelink' options='file=templates/hb-helpers/notelink.md'
title: noteLink
---
# {{ $frontmatter.title }}

The `noteLink`-helper will ...

```handlebars
  {{noteLink path}}
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
[[notepages/school/My Cool Page]]
````

// << docs-handlebars-helper-notelink
*/
/*
// >> id='docs-examples-handlebars-notelink' options='file=examples-tutorials/handlebars/notelink.md'
title: noteLink Helper
---

This uses a simple query to help show what the `noteLink`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    {{noteLink link}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    {{noteLink link}}
  {{/each}}
```

// << docs-examples-handlebars-notelink
*/
export function noteLink(value: string) {
  return new Handlebars.SafeString(`[[${value}]]`);
}
