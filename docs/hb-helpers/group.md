---
layout: default
parent: Handlebars Helpers
grand_parent: Templates
title: group
---

The `group`\-helper will group the result by the specified column.

{% raw %}

```handlebars
{{{#group result by="column_name"}}}
  column_name value is specified by {{value}}
  collection of items in the group is specified by {{items}}
{{/group}}
```

{% endraw %}

See the [group](examples/handlebars/group) page for a full example.