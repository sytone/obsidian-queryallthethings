---
parent: Examples / Tutorials
title: Web based CSV loading
---
# {{ $frontmatter.title }}

This example will help you setup and use the CSV loader functionality using a CSV file from the web. This is similar to the [csv-loader](csv-loader.md) example with the main difference being the CSV file is downloaded from the internet. 

In the configuration the following has been added the the CSV loader configuration.

```
WEB|webcsvexample|https://raw.githubusercontent.com/sytone/obsidian-queryallthethings/refs/heads/main/docs/examples-tutorials/gamedata.csv
```

When prefixed with `WEB|` the processing will expect two more values delimited by the pipe `|` symbol. The first value is the table name, so in this example the table name will be `webcsvexample` and the second value will be the URL. It needs to be accessible by obsidian and not require authentication.

Here is a query that runs against the `webcsvexample` table. The data is pulled from the csv file stored on GitHub.


```qatt
query: |
  SELECT TOP 5 * FROM webcsvexample
template: |
  {{#each result}}
  ## {{player_id}} - {{username}}
  - Level: {{level}}
  - Score: {{score}}
  
  ---
  {{/each}}
```
