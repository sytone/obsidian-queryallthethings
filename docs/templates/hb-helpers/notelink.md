---
layout: default
parent: Handlebars Helpers
grand_parent: Using Templates
title: noteLink
---

The `noteLink`-helper will ...

{% raw %}

```handlebars
  {{noteLink path}}
```

{% endraw %}

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

%%This file is auto-generated. Do not edit. Generated at: Thu Mar 14 2024%%