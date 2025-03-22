---
parent: SQL Functions
grand_parent: Writing Queries
title: notePathWithFileExtension()
---
# {{ $frontmatter.title }}

The `notePathWithFileExtension()` function will return the current page name, so if the file path in your vault is `folder/folder/my cool filename.md` this function will return `folder/folder/my cool filename.md`.

Here are all the page functions to extract information from the current page the query is running on.

````markdown
```qatt
query: |
  SELECT TOP 1 
    notePathWithFileExtension() AS notePathWithFileExtension,
    notePathWithoutFileExtension() AS notePathWithoutFileExtension,
    notePath() AS notePath,
    noteFileName() AS noteFileName
  FROM obsidian_markdown_tasks
template: |
  {{#each result}}
  notePathWithFileExtension: {{notePathWithFileExtension}}
  notePathWithoutFileExtension: {{notePathWithoutFileExtension}}
  notePath: {{notePath}}
  noteFileName: {{noteFileName}}  
  {{/each}}
```
````
