import alasql from 'alasql';

/*
// >> id='docs-sql-statements-joinarray' options='file=queries/sql-statements/joinarray.md'
title: JoinArray
---

## Syntax

```sql
JoinArray ( expressionToFind , expressionToSearch [ , start_location ] )
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
  SELECT JoinArray('string', 'This is the\nstring to search') AS JoinArrayValue
template: |
  {{stringify result}}
```

```json
[ { "JoinArray": 1 } ]
```

// << docs-sql-statements-joinarray
*/
export function registerFunctionJoinArray(): void {
  alasql.fn.JoinArray = function (dataArray: any[], separator?: string): string {
    if (separator === undefined) {
      separator = '';
    }

    if (dataArray !== undefined) {
      return dataArray.join(separator);
    }

    return '';
  };
}

