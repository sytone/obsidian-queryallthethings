/*
// >> id='docs-handlebars-helper-lowercase' options='file=hb-helpers/lowercase.md'
title: lowercase value
---
The `lowercase`\-helper will convert the entire string to lowercase.

{% raw %}

```handlebars
{{{lowercase sentence}}}
```

{% endraw %}

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
