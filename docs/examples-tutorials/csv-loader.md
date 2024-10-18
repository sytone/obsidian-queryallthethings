---

parent: Examples / Tutorials
title: Using CSV loader functionality
---
# {{ $frontmatter.title }}

This example will help you setup and use the CSV loader functionality. If you are viewing this in Obsidian you can see and play with the CSV file loaded for this example. 

In this folder there is a file called `example.csv`, it is a csv file with random data and a comment field that has paragraphs of data. 

Below there is a code block that has a simple query that pulls the top 5 items from the CSV file, by default the file name becomes the table name. So a file called `amazingplacestoeat.csv` will be loaded into a table called `amazingplacestoeat`.

So as the file in this example is called `example.csv` the table is `example` so the query is `SELECT TOP 5 * FROM example`

As the CSV file has text that is multi live in it when it is returned and rendered it will show up as multiple lines. 

```qatt
query: |
  SELECT TOP 5 * FROM example
template: |
  {{#each result}}
  ## {{id}} - All about {{animal}}
  The *{{animal}}* lives in **{{city}}** and loves watching {{movie}}. They have saved {{amount}}.
  
  They love to say...
  
  {{comment}}
  
  ---
  {{/each}}
```
