---

parent: Handlebars Helpers
grand_parent: Using Templates
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