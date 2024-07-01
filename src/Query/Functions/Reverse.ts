import alasql from 'alasql';

/*
// >> id='docs-sql-statements-reverse' options='file=queries/sql-statements/reverse.md'
title: REVERSE
---
# {{ $frontmatter.title }}

## Syntax

```sql
REVERSE ( string )
```

## Returns

Returns the string with the characters in reverse order.

## Example

The following example returns the frontmatter->status value reversed.

```yaml
query: |
  SELECT TOP 2 path AS Path,
    REVERSE(frontmatter->status) AS Status
  FROM obsidian_notes
  WHERE frontmatter->status
template: |
  {{stringify result}}
```

```json
[
  {
    "path": "Projects - Demo Project/Why You Should Be Taking More Notes.md",
    "Status": "gnioD"
  }, {
    "path": "Projects - Demo Project/What I Learned From Taking 15,000 Notes.md",
    "Status": "golkcaB"
  }
]
```

// << docs-sql-statements-reverse
*/
export function registerFunctionReverse(): void {
  alasql.fn.REVERSE = function (value: string): string {
    return value.split('').reverse().join('');
  };
}

