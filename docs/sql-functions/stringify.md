---
layout: default
parent: SQL Functions
grand_parent: Queries
title: stringify(value)
---

%%snippet id='alasql-function-stringify-snippet' options='nocodeblock'%%
The `stringify` function will convert the provided value to a JSON string.

In this example it takes the `stat` property of the first note found and renders it as a JSON blob. This can be handy to explore objects if you are not sure what is available.

{% raw %}

````markdown
```qatt
query: SELECT TOP 1 stringify(stat) AS statPropertyAsJsonString FROM obsidian_markdown_notes
template: |
  {{#each result}}{{statPropertyAsJsonString}}{{/each}}
```
````

{% endraw %}

will result in:

```text
{"ctime":1670345758620,"mtime":1670345758620,"size":316}
```
%%/snippet%%
