import alasql from 'alasql';

/*
// >> id='docs-alasql-function-parsewikilinklocation' options='file=queries/sql-functions/parsewikilinklocation.md'
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

// << docs-alasql-function-parsewikilinklocation
*/
export function registerFunctionParseWikiLinkLocation(): void {
  alasql.fn.parseWikiLinkLocation = function (value: string): string {
    const result = parseWikiLinkFromText(value);

    if (result) {
      const linkAndDisplay = splitOnUnescapedPipe(result);
      return linkAndDisplay[0];
    }

    return '';
  };
}

/*
// >> id='docs-alasql-function-parsewikilinkdisplayname' options='file=queries/sql-functions/parsewikilinkdisplayname.md'
title: parseWikiLinkDisplayName(string)
---
There are multiple functions to help with the parsing of the wiki links in a string.

This is the signature of the function you can use to extract the display name from the wiki link.

- parseWikiLinkDisplayName(value: string): string

In this example it takes the string containing the wiki link and calls the different parsing functions.

```text
Need to work on [[Projects/Painting The House|Painting The House]] soon.
```

````markdown
```qatt
query: |
  SELECT
  parseWikiLinkDisplayName('Need to work on [[Projects/Painting The House|Painting The House]] soon.') AS Display
template: |
  {{stringify result}}
```
````

will result in:

```text
[ { "Display": "Painting The House" } ]
```

// << docs-alasql-function-parsewikilinkdisplayname
*/
export function registerFunctionParseWikiLinkDisplayName(): void {
  alasql.fn.parseWikiLinkDisplayName = function (value: string): string {
    const result = parseWikiLinkFromText(value);
    if (result) {
      const linkAndDisplay = splitOnUnescapedPipe(result);
      return linkAndDisplay[1] ?? '';
    }

    return '';
  };
}

/*
// >> id='docs-alasql-function-wikilinkhasdisplayname' options='file=queries/sql-functions/wikilinkhasdisplayname.md'
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

// << docs-alasql-function-wikilinkhasdisplayname
*/
export function registerFunctionWikiLinkHasDisplayName(): void {
  alasql.fn.wikiLinkHasDisplayName = function (value: string): boolean {
    const result = parseWikiLinkFromText(value);
    if (!result) {
      return false;
    }

    const linkAndDisplay = splitOnUnescapedPipe(result);
    return linkAndDisplay.length === 2 && linkAndDisplay[1] !== undefined;
  };
}

/** Parse a wiki link from a string. */
function parseWikiLinkFromText(text: string): string | undefined {
  // eslint-disable-next-line no-useless-escape
  const re = /\[\[([^\[\]]*?)\]\]/u;

  const result = re.exec(text);
  if (result) {
    return result[1];
  }
}

/** Split on unescaped pipes in an inner link. */
function splitOnUnescapedPipe(link: string): [string, string | undefined] {
  let pipe = -1;
  while ((pipe = link.indexOf('|', pipe + 1)) >= 0) {
    if (pipe > 0 && link[pipe - 1] === '\\') {
      continue;
    }

    return [link.slice(0, Math.max(0, pipe)).replace(/\\\|/g, '|'), link.slice(Math.max(0, pipe + 1))];
  }

  return [link.replace(/\\\|/g, '|'), undefined];
}
