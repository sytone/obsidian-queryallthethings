---

parent: SQL Statements
grand_parent: Writing Queries
title: UNION
---

## Syntax

```sql
{ QUERY_1 }
UNION [ ALL ]
{ QUERY_2 }
[ ...n ]
```

## Arguments

QUERY_1, QUERY_2, QUERY_n return data to be combined with each other. The columns of the queries should match types and be of the same count and name for the final result to be usable.

UNION
Specifies that multiple result sets are to be combined and returned as a single result set.

ALL
Incorporates all rows into the results, including duplicates. If not specified, duplicate rows are removed.

## Returns

A result combining the multipl queries as one resultset.

## Example

The following example uses the CSV export from a list of Azure resource, this is saved as two CSV files in the vault and referenced in the settings so they are loaded as tables when the plugin starts. The file names are `VSUlt.csv` and `VSEnt.csv` so when imported into qatt the tables become `VSUlt` and `VSEnt`. To make it simpler to see the contents of the subscriptions in one place the query unions the two in memory tables and renders a markdown table as output.

```yaml
query: |
  SELECT NAME, TYPE, [RESOURCE GROUP] AS RESOURCEGROUP, LOCATION, SUBSCRIPTION FROM VSUlt
  UNION
  SELECT NAME, TYPE, [RESOURCE GROUP] AS RESOURCEGROUP, LOCATION, SUBSCRIPTION FROM VSEnt
  ORDER BY RESOURCEGROUP, TYPE
template: |
  | Name | Type | Resource Group | Location | Subscription |
  | ---- | ---- | -------------- | -------- | ------------ |
  {{#each result}}
    | {{NAME}} | {{TYPE}} | {{RESOURCEGROUP}} | {{LOCATION}} | {{SUBSCRIPTION}} |
  {{/each}}
```

Note: Output is truncated for example.

```text
| Name           | Type                 | Resource Group | Location | Subscription       |
| -------------- | -------------------- | -------------- | -------- | ------------------ |
| serviceone     | App Service plan     | app-services   | West US  | VSEnt Subscription |
| serviceone-ai  | Application Insights | app-services   | West US  | VSEnt Subscription |
| serviceone-app | Function App         | app-services   | West US  | VSUlt Subscription |
```

## References
- [UNION (Transact-SQL) - SQL Server | Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver16)
- [Union · AlaSQL/alasql Wiki (github.com)](https://github.com/AlaSQL/alasql/wiki/Union)
- [Union All · AlaSQL/alasql Wiki (github.com)](https://github.com/AlaSQL/alasql/wiki/Union-All)
- [SQL UNION Operator (w3schools.com)](https://www.w3schools.com/sql/sql_union.asp)
