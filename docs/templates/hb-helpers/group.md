---

parent: Handlebars Helpers
grand_parent: Using Templates
title: group
---
# {{ $frontmatter.title }}

The `group`\-helper will group the result by the specified column.

```handlebars
{{{#group result by="column_name"}}}
  column_name value is specified by {{value}}
  collection of items in the group is specified by {{items}}
{{/group}}
```

See the [group](../../examples-tutorials/handlebars/group) page for a full example.