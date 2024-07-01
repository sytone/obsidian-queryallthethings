---

parent: Handlebars Helpers
grand_parent: Using Templates
title: lowercase value
---
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