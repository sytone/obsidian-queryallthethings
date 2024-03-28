---
layout: default
parent: Handlebars Helpers
grand_parent: Using Templates
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

%%This file is auto-generated. Do not edit. Generated at: Thu Mar 28 2024%%