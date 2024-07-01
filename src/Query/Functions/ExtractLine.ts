import alasql from 'alasql';

/*
// >> id='docs-sql-statements-extractline' options='file=queries/sql-statements/extractline.md'
title: EXTRACTLINE
---
# {{ $frontmatter.title }}

## Syntax

```sql
EXTRACTLINE ( line_number, stringToExtractLineFrom )
```

## Arguments

*line_number*
A line number to extract from the string.

*stringToExtractLineFrom*
The string to extract the line from.

## Returns

Returns a string containing the line at the specified line number. Empty string if the line number is invalid.

## Example

The following example returns the third line from the string `This\nis\nthe\nstring\nto\nuse`.

```yaml
query: |
  SELECT EXTRACTLINE(3, 'This\nis\nthe\nstring\nto\nuse') AS LineContents
template: |
  {{stringify result}}
```

```json
[ { "LineContents": "the" } ]
```

// << docs-sql-statements-extractline
*/
export function registerFunctionExtractLine(): void {
  alasql.fn.EXTRACTLINE = function (line_number: number, stringToExtractLineFrom: string): string {
    const lines = stringToExtractLineFrom.split('\n');

    if (line_number < 0 || line_number >= lines.length) {
      return '';
    }

    return lines[line_number];
  };
}

