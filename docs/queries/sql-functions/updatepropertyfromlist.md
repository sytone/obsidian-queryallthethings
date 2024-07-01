---

parent: SQL Functions
grand_parent: Writing Queries
title: updatePropertyFromList(value)
---
# {{ $frontmatter.title }}

The `updatePropertyFromList` function will return a link that when clicked will prompt the user to select a value from a list. When the user selects a value the property will be updated on the file.

````markdown
```qatt
query: SELECT TOP 1 updatePropertyFromList(frontmatter->priority, path, @[1, 2, 3], 'priority') AS updatePriority FROM obsidian_notes
template: |
  {{#each result}}{{updatePriority}}{{/each}}
```
````

will result in:

```text
<a onclick="const fun = async() => { let newValue = (await _qatt.ui.promptWithSuggestions(['1', '2', '3'],['1', '2', '3']));if(newValue !== null) {app.fileManager.processFrontMatter(app.vault.getAbstractFileByPath('2 Projects/ProjectX.md'), (f) => { f.priority = newValue; });}}; fun();">3</a>
```