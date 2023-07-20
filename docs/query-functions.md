---
nav_order: 4
layout: default
title: Query Functions
---

The main query engine AlaSQL allows for functions to be added to it. By default the following functions have been made available to make the query process simpler.

> [!NOTE]
> Dynamic creation of functions via js snippets is coming in a future release.

Full details on AlaSQL can be found on their site and will not be replicated here.

[AlaSQL Wiki](https://github.com/AlaSQL/alasql/wiki)

## Custom AlaSQL Functions

The following functions are available to manipulate date or to help with the query.

%%snippet id='alasql-function-stringify-snippet' options='nocodeblock'%%

### stringify(value)

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

