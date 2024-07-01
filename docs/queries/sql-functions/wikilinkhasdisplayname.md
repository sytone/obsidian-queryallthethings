---

parent: SQL Functions
grand_parent: Writing Queries
title: wikiLinkHasDisplayName(string)
---
There are multiple functions to help with the parsing of the wiki links in a string.

This is the signature of the function you can use to check if the wiki link has a display name.

- wikiLinkHasDisplayName(value: string): boolean

In this example it takes the string containing the wiki link and calls the different parsing functions.

```text
Need to work on [[Projects/Painting The House|Painting The House]] soon.
```

````markdown
```qatt
query: |
  SELECT
  wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS HasDisplay,
  wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.') AS HasNoDisplay,
  IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiLinkDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.')) AS HasDisplayIf,
  IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.'), parseWikiLinkDisplayName('Need to work on [[Projects/Painting The House|Will Not show]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House]] soon.')) AS HasNoDisplayIf
template: |
  {{stringify result}}
```
````

will result in:

```text
[ { "HasDisplay": true, "HasNoDisplay": false, "HasDisplayIf": "Painting The House", "HasNoDisplayIf": "Projects/Painting The House" } ]
```