---

parent: SQL Statements
grand_parent: Writing Queries
title: COALESCE
---

Show first NON NULL and non-NaN parameter:

```sql
SELECT path, COALESCE(frontmatter->area, frontmatter->Area, '') AS Area
FROM obsidian_notes
```

```sql
SELECT CAST(COALESCE(hourly_wage * 40 * 52,
    salary,
    commission * num_sales) AS money) AS [Total Salary]
FROM wages
ORDER BY [Total Salary];
```
