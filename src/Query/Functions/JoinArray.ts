import alasql from 'alasql';

/*
// >> id='docs-sql-statements-joinarray' options='file=queries/sql-statements/joinarray.md'
title: JoinArray
---
# {{ $frontmatter.title }}

## Syntax

```sql
JoinArray ( dataArray [ , separator ] )
```

## Arguments

*dataArray*
An array of strings to be joined.

*separator*
A string to be used as a separator. If omitted, the array elements are not separated with anything.

## Returns

A string that is the result of concatenating the array elements.

## Example

The following example finds the location of the word `string` in the string `This is the string to search`.

```yaml
query: |
  SELECT JoinArray(@['Hello','World','!']) AS JoinArrayValue
template: |
  {{stringify result}}
```

```json
[ { "JoinArrayValue": "HelloWorld!" } ]
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

