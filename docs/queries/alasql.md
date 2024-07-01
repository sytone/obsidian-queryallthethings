---

title: AlaSQL Queries
order: 1
parent: Writing Queries
---
# Writing queries and using the features of AlaSQL

AlaSQL support most normal SQL queries, including the creation of tables and insertion of data. As this is in memory you need to ensure you keep a copy of this data and execute it during the startup of the plugin using the settings or store the information in local storage.

The plugin already has a database in local storage called `qatt` that has the event log as well as the reference calendar for your convenience. See [Adding tables to the local storage database](#Adding%20tables%20to%20the%20local%20storage%20database) for more details.

When writing queries you can use the inbuilt tables documented on [Data Tables](../data-tables/index) to search for data. These are all based on your notes and metadata in them.


## Adding tables to the local storage database

To add tables and data to the local storage database so you can access it between loads of Obsidian you can use the following SQL commands as an example

```sql
CREATE TABLE IF NOT EXISTS qatt.MyCoolFacts (created DATETIME, fact STRING, source STRING)
INSERT INTO qatt.MyCoolFacts VALUES ( '2023-08-03', 'The Query All The Things plugin for Obsidian allows you to store information in tables for later use!', 'Query All The Things Wiki' )
```

## Quirky things about AlaSQL
Ref: [Quirky · AlaSQL/alasql Wiki (github.com)](https://github.com/alasql/alasql/wiki/Quirky)

### [Column names](https://github.com/alasql/alasql/wiki/Quirky#column-names)

You can use

```
[column]
```

or

```
`column`
```

for columns with spaces, special symbols, etc. This also applies to **column named with [AlaSQL Reserved Keywords](#AlaSQL%20Reserved%20Keywords)** independent of the letter case. So names like `date`, `begin`, `content`, `last`, `max`, `min`, `count`, `natural`, `path`, `right`, `show`, `temp`, `timeout`, `target`, `top`, `value`, and `work` needs to be wrapped.

### [Escaping characters](https://github.com/alasql/alasql/wiki/Quirky#escaping-characters)

AlaSQL parses queries as JavaScript strings before parsing them as SQL. Because of this, you need to double escape special characters such as double quotes using two backslashes instead of one. For example:

```
alasql('SELECT "You should \\"double escape\\" double quotes"')
```


## AlaSQL Reserved Keywords
Ref: [AlaSQL Keywords · AlaSQL/alasql Wiki (github.com)](https://github.com/alasql/alasql/wiki/AlaSQL-Keywords)

Please, use square brackets `[name]` or back-quotes `` `name` `` if you want to use these words for columns and variables. All AlaSQL keywords are case-insensitive.

- [ABSOLUTE](https://github.com/alasql/alasql/wiki/ABSOLUTE)
- [ACTION](https://github.com/alasql/alasql/wiki/ACTION)
- [ADD](https://github.com/alasql/alasql/wiki/ADD)
- [AGGR](https://github.com/alasql/alasql/wiki/AGGR)
- [ALL](https://github.com/alasql/alasql/wiki/ALL)
- [ALTER](https://github.com/alasql/alasql/wiki/ALTER)
- [AND](https://github.com/alasql/alasql/wiki/AND)
- [ANTI](https://github.com/alasql/alasql/wiki/ANTI)
- [ANY](https://github.com/alasql/alasql/wiki/ANY)
- [APPLY](https://github.com/alasql/alasql/wiki/APPLY)
- [ARRAY](https://github.com/alasql/alasql/wiki/ARRAY)
- [AS](https://github.com/alasql/alasql/wiki/AS)
- [ASSERT](https://github.com/alasql/alasql/wiki/ASSERT)
- [ASC](https://github.com/alasql/alasql/wiki/ASC)
- [ATTACH](https://github.com/alasql/alasql/wiki/ATTACH)
- [AUTOINCREMENT](https://github.com/alasql/alasql/wiki/AUTOINCREMENT)
- [AUTO_INCREMENT](https://github.com/alasql/alasql/wiki/AUTO_INCREMENT)
- [AVG](https://github.com/alasql/alasql/wiki/AVG)
- [BEGIN](https://github.com/alasql/alasql/wiki/BEGIN)
- [BETWEEN](https://github.com/alasql/alasql/wiki/BETWEEN)
- [BREAK](https://github.com/alasql/alasql/wiki/BREAK)
- [BY](https://github.com/alasql/alasql/wiki/BY)
- [CALL](https://github.com/alasql/alasql/wiki/CALL)
- [CASE](https://github.com/alasql/alasql/wiki/CASE)
- [CAST](https://github.com/alasql/alasql/wiki/CAST)
- [CHECK](https://github.com/alasql/alasql/wiki/CHECK)
- [CLASS](https://github.com/alasql/alasql/wiki/CLASS)
- [CLOSE](https://github.com/alasql/alasql/wiki/CLOSE)
- [COLLATE](https://github.com/alasql/alasql/wiki/COLLATE)
- [COLUMN](https://github.com/alasql/alasql/wiki/COLUMN)
- [COLUMNS](https://github.com/alasql/alasql/wiki/COLUMNS)
- [COMMIT](https://github.com/alasql/alasql/wiki/COMMIT)
- [CONSTRAINT](https://github.com/alasql/alasql/wiki/CONSTRAINT)
- [CONTENT](https://github.com/alasql/alasql/wiki/CONTENT)
- [CONTINUE](https://github.com/alasql/alasql/wiki/CONTINUE)
- [CONVERT](https://github.com/alasql/alasql/wiki/CONVERT)
- [CORRESPONDING](https://github.com/alasql/alasql/wiki/CORRESPONDING)
- [COUNT](https://github.com/alasql/alasql/wiki/COUNT)
- [CREATE](https://github.com/alasql/alasql/wiki/CREATE)
- [CROSS](https://github.com/alasql/alasql/wiki/CROSS)
- [CUBE](https://github.com/alasql/alasql/wiki/CUBE)
- [CURRENT_TIMESTAMP](https://github.com/alasql/alasql/wiki/CURRENT_TIMESTAMP)
- [CURSOR](https://github.com/alasql/alasql/wiki/CURSOR)
- [DATABASE](https://github.com/alasql/alasql/wiki/DATABASE)
- [DECLARE](https://github.com/alasql/alasql/wiki/DECLARE)
- [DEFAULT](https://github.com/alasql/alasql/wiki/DEFAULT)
- [DELETE](https://github.com/alasql/alasql/wiki/DELETE)
- [DELETED](https://github.com/alasql/alasql/wiki/DELETED)
- [DESC](https://github.com/alasql/alasql/wiki/DESC)
- [DETACH](https://github.com/alasql/alasql/wiki/DETACH)
- [DISTINCT](https://github.com/alasql/alasql/wiki/DISTINCT)
- [DOUBLEPRECISION](https://github.com/alasql/alasql/wiki/DOUBLEPRECISION)
- [DROP](https://github.com/alasql/alasql/wiki/DROP)
- [ECHO](https://github.com/alasql/alasql/wiki/ECHO)
- [EDGE](https://github.com/alasql/alasql/wiki/EDGE)
- [END](https://github.com/alasql/alasql/wiki/END)
- [ENUM](https://github.com/alasql/alasql/wiki/ENUM)
- [ELSE](https://github.com/alasql/alasql/wiki/ELSE)
- [EXCEPT](https://github.com/alasql/alasql/wiki/EXCEPT)
- [EXISTS](https://github.com/alasql/alasql/wiki/EXISTS)
- [EXPLAIN](https://github.com/alasql/alasql/wiki/EXPLAIN)
- [FALSE](https://github.com/alasql/alasql/wiki/FALSE)
- [FETCH](https://github.com/alasql/alasql/wiki/FETCH)
- [FIRST](https://github.com/alasql/alasql/wiki/FIRST)
- [FOREIGN](https://github.com/alasql/alasql/wiki/FOREIGN)
- [FROM](https://github.com/alasql/alasql/wiki/FROM)
- [GO](https://github.com/alasql/alasql/wiki/GO)
- [GRAPH](https://github.com/alasql/alasql/wiki/GRAPH)
- [GROUP](https://github.com/alasql/alasql/wiki/GROUP)
- [GROUPING](https://github.com/alasql/alasql/wiki/GROUPING)
- [HAVING](https://github.com/alasql/alasql/wiki/HAVING)
- [HELP](https://github.com/alasql/alasql/wiki/HELP)
- [IF](https://github.com/alasql/alasql/wiki/IF)
- [IDENTITY](https://github.com/alasql/alasql/wiki/IDENTITY)
- [IS](https://github.com/alasql/alasql/wiki/IS)
- [IN](https://github.com/alasql/alasql/wiki/IN)
- [INDEX](https://github.com/alasql/alasql/wiki/INDEX)
- [INNER](https://github.com/alasql/alasql/wiki/INNER)
- [INSERT](https://github.com/alasql/alasql/wiki/INSERT)
- [INSERTED](https://github.com/alasql/alasql/wiki/INSERTED)
- [INTERSECT](https://github.com/alasql/alasql/wiki/INTERSECT)
- [INTO](https://github.com/alasql/alasql/wiki/INTO)
- [JOIN](https://github.com/alasql/alasql/wiki/JOIN)
- [KEY](https://github.com/alasql/alasql/wiki/KEY)
- [LAST](https://github.com/alasql/alasql/wiki/LAST)
- [LET](https://github.com/alasql/alasql/wiki/LET)
- [LEFT](https://github.com/alasql/alasql/wiki/LEFT)
- [LIKE](https://github.com/alasql/alasql/wiki/LIKE)
- [LIMIT](https://github.com/alasql/alasql/wiki/LIMIT)
- [LOOP](https://github.com/alasql/alasql/wiki/LOOP)
- [MATCHED](https://github.com/alasql/alasql/wiki/MATCHED)
- [MATRIX](https://github.com/alasql/alasql/wiki/MATRIX)
- [MAX](https://github.com/alasql/alasql/wiki/MAX)
- [MERGE](https://github.com/alasql/alasql/wiki/MERGE)
- [MIN](https://github.com/alasql/alasql/wiki/MIN)
- [MINUS](https://github.com/alasql/alasql/wiki/MINUS)
- [MODIFY](https://github.com/alasql/alasql/wiki/MODIFY)
- [NATURAL](https://github.com/alasql/alasql/wiki/NATURAL)
- [NEXT](https://github.com/alasql/alasql/wiki/NEXT)
- [NEW](https://github.com/alasql/alasql/wiki/NEW)
- [NOCASE](https://github.com/alasql/alasql/wiki/NOCASE)
- [NO](https://github.com/alasql/alasql/wiki/NO)
- [NOT](https://github.com/alasql/alasql/wiki/NOT)
- [NULL](https://github.com/alasql/alasql/wiki/NULL)
- [OFF](https://github.com/alasql/alasql/wiki/OFF)
- [ON](https://github.com/alasql/alasql/wiki/ON)
- [ONLY](https://github.com/alasql/alasql/wiki/ONLY)
- [OFFSET](https://github.com/alasql/alasql/wiki/OFFSET)
- [OPEN](https://github.com/alasql/alasql/wiki/OPEN)
- [OPTION](https://github.com/alasql/alasql/wiki/OPTION)
- [OR](https://github.com/alasql/alasql/wiki/OR)
- [ORDER](https://github.com/alasql/alasql/wiki/ORDER)
- [OUTER](https://github.com/alasql/alasql/wiki/OUTER)
- [OVER](https://github.com/alasql/alasql/wiki/OVER)
- [PATH](https://github.com/alasql/alasql/wiki/PATH)
- [PARTITION](https://github.com/alasql/alasql/wiki/PARTITION)
- [PERCENT](https://github.com/alasql/alasql/wiki/PERCENT)
- [PLAN](https://github.com/alasql/alasql/wiki/PLAN)
- [PRIMARY](https://github.com/alasql/alasql/wiki/PRIMARY)
- [PRINT](https://github.com/alasql/alasql/wiki/PRINT)
- [PRIOR](https://github.com/alasql/alasql/wiki/PRIOR)
- [QUERY](https://github.com/alasql/alasql/wiki/QUERY)
- [READ](https://github.com/alasql/alasql/wiki/READ)
- [RECORDSET](https://github.com/alasql/alasql/wiki/RECORDSET)
- [REDUCE](https://github.com/alasql/alasql/wiki/REDUCE)
- [REFERENCES](https://github.com/alasql/alasql/wiki/REFERENCES)
- [RELATIVE](https://github.com/alasql/alasql/wiki/RELATIVE)
- [REPLACE](https://github.com/AlaSQL/alasql/wiki/REPLACE)
- [REMOVE](https://github.com/alasql/alasql/wiki/REMOVE)
- [RENAME](https://github.com/alasql/alasql/wiki/RENAME)
- [REQUIRE](https://github.com/alasql/alasql/wiki/REQUIRE)
- [RESTORE](https://github.com/alasql/alasql/wiki/RESTORE)
- [RETURN](https://github.com/alasql/alasql/wiki/RETURN)
- [RETURNS](https://github.com/alasql/alasql/wiki/RETURNS)
- [RIGHT](https://github.com/alasql/alasql/wiki/RIGHT)
- [ROLLBACK](https://github.com/alasql/alasql/wiki/ROLLBACK)
- [ROLLUP](https://github.com/alasql/alasql/wiki/ROLLUP)
- [ROW](https://github.com/alasql/alasql/wiki/ROW)
- [SCHEMA(S)?](https://github.com/alasql/alasql/wiki/SCHEMA(S)?)
- [SEARCH](https://github.com/alasql/alasql/wiki/SEARCH)
- [SELECT](https://github.com/alasql/alasql/wiki/SELECT)
- [SEMI](https://github.com/alasql/alasql/wiki/SEMI)
- [SET](https://github.com/alasql/alasql/wiki/SET)
- [SETS](https://github.com/alasql/alasql/wiki/SETS)
- [SHOW](https://github.com/alasql/alasql/wiki/SHOW)
- [SOME](https://github.com/alasql/alasql/wiki/SOME)
- [SOURCE](https://github.com/alasql/alasql/wiki/SOURCE)
- [STRATEGY](https://github.com/alasql/alasql/wiki/STRATEGY)
- [STORE](https://github.com/alasql/alasql/wiki/STORE)
- [SUM](https://github.com/alasql/alasql/wiki/SUM)
- [TABLE](https://github.com/alasql/alasql/wiki/TABLE)
- [TABLES](https://github.com/alasql/alasql/wiki/TABLES)
- [TARGET](https://github.com/alasql/alasql/wiki/TARGET)
- [TEMP](https://github.com/alasql/alasql/wiki/TEMP)
- [TEMPORARY](https://github.com/alasql/alasql/wiki/TEMPORARY)
- [TEXTSTRING](https://github.com/alasql/alasql/wiki/TEXTSTRING)
- [THEN](https://github.com/alasql/alasql/wiki/THEN)
- [TIMEOUT](https://github.com/alasql/alasql/wiki/TIMEOUT)
- [TO](https://github.com/alasql/alasql/wiki/TO)
- [TOP](https://github.com/alasql/alasql/wiki/TOP)
- [TRAN](https://github.com/alasql/alasql/wiki/TRAN)
- [TRANSACTION](https://github.com/alasql/alasql/wiki/TRANSACTION)
- [TRIGGER](https://github.com/AlaSQL/alasql/wiki/TRIGGER)
- [TRUE](https://github.com/alasql/alasql/wiki/TRUE)
- [TRUNCATE](https://github.com/alasql/alasql/wiki/TRUNCATE)
- [UNION](https://github.com/alasql/alasql/wiki/UNION)
- [UNIQUE](https://github.com/alasql/alasql/wiki/UNIQUE)
- [UPDATE](https://github.com/alasql/alasql/wiki/UPDATE)
- [USE](https://github.com/alasql/alasql/wiki/USE)
- [USING](https://github.com/alasql/alasql/wiki/USING)
- [VALUE](https://github.com/alasql/alasql/wiki/VALUE)
- [VERTEX](https://github.com/alasql/alasql/wiki/VERTEX)
- [VIEW](https://github.com/alasql/alasql/wiki/VIEW)
- [WHEN](https://github.com/alasql/alasql/wiki/WHEN)
- [WHERE](https://github.com/alasql/alasql/wiki/WHERE)
- [WHILE](https://github.com/alasql/alasql/wiki/WHILE)
- [WITH](https://github.com/alasql/alasql/wiki/WITH)
- [WORK](https://github.com/alasql/alasql/wiki/WORK)
