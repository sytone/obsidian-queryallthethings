---
nav_order: 2
layout: default
title: 🐣 Your First Query
---

The main query language backing the plugin is SQL based. There are fantastic resources out there to help you work with and understand SQL. The engine supports the large majority of statements including the ability for you to make your own tables in memory.

To get started the plugin expects that you have a codeblock with `qatt` as the type. Below is the simplest starting query which lists the latest page that was created. All the configuration in the code block is based off the YAML structure so all guidance from (https://yaml.org/)[https://yaml.org/] is valid.

In the example below you have the `query`, as noted this is based off SQL so sites like [SQL Tutorial (w3schools.com)](https://www.w3schools.com/sql/) will be helpful if you are not familiar with the language or its been a while. This query will select the first record found when ordered by the files created time where the date is in descending order so the most recent will be displayed first. The FROM like indicates it is from the internal markdown files collection stored by Obsidian natively.

{% raw %}
````markdown
```qatt
query: |
  SELECT TOP 1 *
  FROM obsidian_markdown_files
  ORDER BY stat->ctime DESC
template: |
      {{#each result}}
        [[{{path}}\|{{basename}}]]
      {{/each}}
```
````
{% endraw %}
