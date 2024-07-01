---

parent: SQL Statements
grand_parent: Writing Queries
title: IN
---

Referenced From: <https://github.com/AlaSQL/alasql/wiki>

Syntax:

```sql
    expression IN array
```

AlaSQL supports ```IN``` operation:

```sql
    SELECT path FROM obsidian_notes WHERE 'project' IN tags
    SELECT a FROM one WHERE b IN (1,2,3)
    SELECT a FROM one WHERE b IN (SELECT b FROM two)
    SELECT a FROM one WHERE b IN ?
```

### In the expression

```js
    expression IN @(expression)
```

like:

```sql
    SELECT path FROM obsidian_notes WHERE frontmatter->area IN @('area1','area2')
    10 IN @(?)
    @a IN @(@b)
    20 IN @(@[10,20,30])
```
