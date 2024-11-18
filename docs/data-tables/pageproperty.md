---
order: 13

parent: Data Tables
title: PAGEPROPERTY
---

# PAGEPROPERTY Table

Table Name: `PAGEPROPERTY`

This is a dynamic table based off the page the query is running on. The two examples below show ways this can be used.

## Tags property

A good example is the `tags` page property. Functionality is best shown by the example below.

If a not has the following YAML/property:

```
___
tags:
  - Value1
  - Value2
  - Value3
  - Value4
  - Value5
___

# Heading 1
```

The following query will return the TOP 2 tags from the list, you can make the query as complex as you want based on the data in the YAML header.

````markdown
```qatt
query: |
  SELECT TOP 2 _ AS tag FROM PAGEPROPERTY("tags")
template: |
  {{stringify result}}
```
````
The output would be:

```
[
{
"tag": "Value1"
},
{
"tag": "Value2"
}
]
```

## Custom property

YAML Header:

```
___
areas:
  - Family
  - Finances
  - Manager
  - Business
  - Career Growth
  - Personal Productivity
___

# Heading 1
```

Query all items and make a list of them.

````markdown
```qatt
query: |
  SELECT _ AS area FROM PAGEPROPERTY("areas")
template: |
  {{#each result}}
  - {{area}}
  {{/each}}
```
````
The output would be:

```
- Family
- Finances
- Manager
- Oro Business
- Career Growth
- Personal Productivity
```
