/*
// >> id='docs-handlebars-helper-lowercase' options='file=templates/hb-helpers/lowercase.md'
title: lowercase value
---
# {{ $frontmatter.title }}

The `lowercase`\-helper will convert the entire string to lowercase.

```handlebars
{{{lowercase sentence}}}
```

when used with this context:

```json
{
  sentence: "This Is Some SENtence"
}
```

will result in:

```text
this is some sentence
```

// << docs-handlebars-helper-lowercase
*/
export function uppercase(value: string) {
  return value ? value.toUpperCase() : value;
}
