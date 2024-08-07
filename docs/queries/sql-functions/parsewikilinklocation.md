---

parent: SQL Functions
grand_parent: Writing Queries
title: parseWikiLinkLocation(string)
---
# {{ $frontmatter.title }}

There are multiple functions to help with the parsing of the wiki links in a string.

This is the signature of the function you can use to extract the location from the wiki link.

- parseWikiLinkLocation(value: string): string

In this example it takes the string containing the wiki link and calls the different parsing functions.

```text
Need to work on [[Projects/Painting The House|Painting The House]] soon.
```

````markdown
```qatt
query: |
  SELECT
  parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Location
template: |
  {{stringify result}}
```
````

will result in:

```text
[ { "Location": "Projects/Painting The House" } ]
```