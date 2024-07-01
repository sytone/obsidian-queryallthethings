---

parent: Handlebars Helpers
grand_parent: Using Templates
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