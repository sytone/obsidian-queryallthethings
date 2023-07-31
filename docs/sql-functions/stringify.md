---
layout: default
parent: SQL Functions
title: stringify(value)
---

%%snippet id='alasql-function-stringify-snippet' options='nocodeblock'%%

The `stringify` function will convert the provided value to a JSON string.

{% raw %}

```qatt
query: SELECT TOP 1 stringify(stat) AS statPropertyAsJsonString FROM obsidian_markdown_notes
template: |
  {{#each result}}{{statPropertyAsJsonString}}{{/each}}
```

{% endraw %}

will result in:

```text
{"ctime":1670345758620,"mtime":1670345758620,"size":316}
```

%%/snippet%%
