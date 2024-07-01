---

parent: SQL Statements
grand_parent: Writing Queries
title: IF ... THEN ... ELSE
---

Syntax:

```sql
    IF expression THEN statement1 [ELSE statement2]
```

Obsidian Example:

```sql
    SELECT
      IIF( frontmatter->status = 'Done', '✔️', '⏹️') AS StatusEmoji
      FROM obsidian_notes WHERE
```

For example:

```sql
    IF EXISTS(SELECT * FROM one WHERE a=10)
       UPDATE one SET b = 200 WHERE a=10
    ELSE
       INSERT INTO one VALUES (5,500);
```

Alternative Syntax:

MySQL notation

```sql
SELECT IF(1>2,2,3);
```

Will return 3

or the MsSQL notation

```sql
SELECT IIF(1>2,2,3);
```

Will return 3
