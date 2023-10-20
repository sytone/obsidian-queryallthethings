---
layout: default
parent: Handlebars Helpers
grand_parent: Templates
title: stringify value
---
The `stringify`\-helper will convert the referenced object to a JSON string.

{% raw %}

```handlebars
  {{{stringify complexObject}}}
```

{% endraw %}

when used with this context:

```json
{
  complexObject: {
    "this": "is",
    "a": "complex",
    "object": "with",
    "lots": "of",
    "things": "in",
    "it": "!"
  }
}
```

will result in:

```text
{
  complexObject: {
    "this": "is",
    "a": "complex",
    "object": "with",
    "lots": "of",
    "things": "in",
    "it": "!"
  }
}
```