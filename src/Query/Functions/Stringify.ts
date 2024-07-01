import alasql from 'alasql';

/*
// >> id='alasql-function-stringify-snippet' options='file=queries/sql-functions/stringify.md'
title: stringify(value)
---
# {{ $frontmatter.title }}

The `stringify` function will convert the provided value to a JSON string.

In this example it takes the `stat` property of the first note found and renders it as a JSON blob. This can be handy to explore objects if you are not sure what is available.

````markdown
```qatt
query: SELECT TOP 1 stringify(stat) AS statPropertyAsJsonString FROM obsidian_notes
template: |
  {{#each result}}{{statPropertyAsJsonString}}{{/each}}
```
````

will result in:

```text
{"ctime":1670345758620,"mtime":1670345758620,"size":316}
```
// << alasql-function-stringify-snippet
*/
export function registerFunctionStringify(): void {
  alasql.fn.stringify = function (value) {
    return JSON.stringify(value);
  };
}
