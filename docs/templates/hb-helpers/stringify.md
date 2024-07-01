---

parent: Handlebars Helpers
grand_parent: Using Templates
title: stringify value
---
# {{ $frontmatter.title }}

The `stringify`\-helper will convert the referenced object to a JSON string. If a cyclical object is used the helper will return `[Cyclical]` for the nested instances to prevent infinite recursion.

```handlebars
  {{{stringify complexObject}}}
```

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