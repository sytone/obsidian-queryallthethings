---
parent: SQL Functions
grand_parent: Writing Queries
title: noteFileName()
---
# {{ $frontmatter.title }}

The `noteFileName()` function will return the current page name, so if the file path in your vault is `/folder/folder/my cool filename.md` this function will return `my cool filename`.

This can be used on pages to make qeries that find information in your vault that references this page name. For example the below block will find all tasks with a reference to this page name in them. 

````markdown
```qatt
query: |
  SELECT page, getNoteName(page) AS name, text
  FROM obsidian_markdown_tasks
  WHERE
    text LIKE '%'+noteFileName()+'%'
template: |
  | File | Task |
  | ---- | ---- |
  {{#each result}}
  |{{obsidianHtmlInternalLink page name}} | {{text}}|
  {{/each}}
```
````
