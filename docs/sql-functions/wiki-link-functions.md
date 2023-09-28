---
layout: default
parent: SQL Functions
grand_parent: Queries
title: Wiki Link functions
---
There are multiple functions to help with the parsing of the wiki links in a string.

This is the signature of the functions you can use in the queries.

- parseWikiLinkLocation(value: string): string
- parseWikiDisplayName(value: string): string
- wikiLinkHasDisplayName(value: string): boolean

In this example it takes the string containing the wiki link and calls the different parsing functions.

```text
Need to work on [[Projects/Painting The House|Painting The House]] soon.
```

{% raw %}

````markdown
```qatt
query: |
  SELECT
  parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Location,
  parseWikiDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Display,
  wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS HasDisplay,
  wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.') AS HasNoDisplay,
  IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House|Painting The House]] soon.')) AS HasDisplayIf,
  IIF(wikiLinkHasDisplayName('Need to work on [[Projects/Painting The House]] soon.'), parseWikiDisplayName('Need to work on [[Projects/Painting The House|Will Not show]] soon.'), parseWikiLinkLocation('Need to work on [[Projects/Painting The House]] soon.')) AS HasNoDisplayIf
template: |
  {{stringify result}}
```
````

{% endraw %}

will result in:

```text
[ { "Location": "Projects/Painting The House", "Display": "Painting The House", "HasDisplay": true, "HasNoDisplay": false, "HasDisplayIf": "Painting The House", "HasNoDisplayIf": "Projects/Painting The House" } ]
```