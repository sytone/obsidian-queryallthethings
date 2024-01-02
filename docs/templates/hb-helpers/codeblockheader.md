---
layout: default
parent: Handlebars Helpers
grand_parent: Using Templates
title: codeBlockHeader
---

The `codeBlockHeader`\-helper will insert the three back ticks into the resulting markdown with the name specified as a parameter as the code block type.

{% raw %}

```handlebars
  {{codeBlockHeade 'text'}}
```

{% endraw %}

will result in:

````markdown
```text
````

%%This file is auto-generated. Do not edit. Generated at: Tue Jan 02 2024%%