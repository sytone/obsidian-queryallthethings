import alasql from 'alasql';

/*
// >> id='docs-sql-statements-lineindex' options='file=queries/sql-statements/lineindex.md'
title: LINEINDEX
---

## Syntax

```sql
LINEINDEX ( expressionToFind , expressionToSearch [ , start_location ] )
```

## Arguments

*expressionToFind*
A character expression containing the sequence to find.

*expressionToSearch*
A character expression to search.

*start_location*
An line number at which the search starts. If start_location is not specified, has a negative value, or has a zero (0) value, the search starts at the beginning of expressionToSearch.

## Returns

Returns a line number indicating the line in the string where the expression is found.

## Example

The following example finds the location of the word `string` in the string `This is the string to search`.

```yaml
query: |
  SELECT LINEINDEX('string', 'This is the\nstring to search') AS LineIndex
template: |
  {{stringify result}}
```

```json
[ { "LineIndex": 1 } ]
```

// << docs-sql-statements-lineindex
*/
export function registerFunctionLineIndex(): void {
  alasql.fn.LINEINDEX = function (expressionToFind: string, expressionToSearch: string, start_location?: number): number {
    let line = 0;
    let matchedChars = 0;

    if (start_location !== undefined) {
      expressionToSearch = expressionToSearch.split('\n').slice(start_location).join('\n');
    }

    for (const element of expressionToSearch) {
      if (element === expressionToFind[matchedChars]) {
        matchedChars++;
      } else {
        matchedChars = 0;
      }

      if (matchedChars === expressionToFind.length) {
        return line;
      }

      if (element === '\n') {
        line++;
      }
    }

    return -1;
  };
}

