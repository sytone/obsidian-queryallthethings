import alasql from 'alasql';

/*
// >> id='alasql-function-rand' options='file=queries/sql-functions/rand.md'
title: rand()
---
# {{ $frontmatter.title }}

The `rand()` function returns a random floating-point number between 0 (inclusive) and 1 (exclusive).

## Syntax
```sql
SELECT RAND()
```

## Examples
```sql
-- Generate a random number
SELECT RAND() AS random_value

-- Generate 5 random numbers
SELECT RAND() AS random_value FROM (VALUES(1),(2),(3),(4),(5)) AS t(n)

-- Use in a calculation (random number between 1 and 100)
SELECT ROUND(RAND() * 99 + 1) AS random_1_to_100
```
// << alasql-function-rand
*/
export function registerFunctionRand(): void {
  alasql.fn.RAND = function () {
    return Math.random();
  };
}
