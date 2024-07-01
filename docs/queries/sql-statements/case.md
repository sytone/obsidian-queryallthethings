---

parent: SQL Statements
grand_parent: Writing Queries
title: CASE
---

Syntax:

```sql
CASE
    WHEN expression1 THEN expression1
    WHEN expression2 THEN expression2
    WHEN expressionN THEN expressionN
    ELSE expression
END;
```

```sql
CASE
    WHEN frontmatter->status = 'Todo' THEN '⏹️'
    WHEN frontmatter->status = 'In progress' THEN '🏗'
    WHEN frontmatter->status = 'Blocked' THEN '👀'
    WHEN frontmatter->status = 'Done' THEN '✅'
    ELSE '❓'
END AS StatusEmoji
```
