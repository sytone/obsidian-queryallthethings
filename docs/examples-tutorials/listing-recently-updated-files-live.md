---

parent: Examples / Tutorials
title: Listing recently updated files
exclude: true
---
# {{ $frontmatter.title }}

This example will walk you though making a codeblock that lists the 10 most recently modified files.

The query below will return the top 10 notes from the `obsidian_notes` table, it will order them by the last modified time (`stat->mtime`) in a descending (`DESC`) order. In addition to all the columns in the table it adds a new colum with the value set to a human readable string stating how long ago the modification was. This uses moment and parses the `mtime` and get the time since now.

If you are using javascript objects instead of using the `.` when calling functions/properties off classes you use a `->` to address the function or property.

```qatt
query: |
  SELECT TOP 10 *, moment(stat->mtime)->fromNow() AS LastModified
  FROM obsidian_notes
  ORDER BY stat->mtime DESC
template: |
  {{#each result}}
    - [[{{path}}|{{basename}}]] was updated {{LastModified}}
  {{/each}}
```
