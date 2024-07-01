---

parent: SQL Statements
grand_parent: Writing Queries
title: pageProperty
---

## Syntax

```sql
pageProperty ( string )
```

## Returns

Returns the value of the front matter field specified from the page the query is running on.

## Example

The following example returns the frontmatter->status value reversed.

```yaml
query: |
  SELECT pageProperty('task_status') AS TaskStatus
template: |
  {{#each result}}
    The page property 'task_status' is set to {{TaskStatus}}
  {{/each}}
```

```text
The page property 'task_status' is set to x

```

Open these pages in an Obsidian vault and view 'Examples\using-pageproperty-simple-live.md' for a live example.