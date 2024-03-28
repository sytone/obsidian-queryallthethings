---
layout: default
parent: Handlebars Helpers
grand_parent: Using Templates
title: pad
---

The `pad`-helper will pad a string with the specified character the specified number of times. By default the character is a space ' '.

{% raw %}

```handlebars
  {{pad}}
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
...
````

%%This file is auto-generated. Do not edit. Generated at: Wed Mar 27 2024%%