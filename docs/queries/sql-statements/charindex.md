---

parent: SQL Statements
grand_parent: Writing Queries
title: CHARINDEX
---
# {{ $frontmatter.title }}

## Syntax

```sql
CHARINDEX ( expressionToFind , expressionToSearch [ , start_location ] )
```

## Arguments

*expressionToFind*
A character expression containing the sequence to find.

*expressionToSearch*
A character expression to search.

*start_location*
An number at which the search starts. If start_location is not specified, has a negative value, or has a zero (0) value, the search starts at the beginning of expressionToSearch.

## Returns

Returns a number indicating the position in the string.

## Example

The following example finds the location of the word `string` in the string `This is the string to search`.

```yaml
query: |
  SELECT CHARINDEX('string', 'This is the string to search') AS StringIndex
template: |
  {{stringify result}}
```

```json
[ { "StringIndex": 13 } ]
```