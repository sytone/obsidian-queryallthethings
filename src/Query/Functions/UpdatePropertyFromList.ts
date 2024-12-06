import alasql from 'alasql';

/*
// >> id='alasql-function-updatepropertyfromlist-snippet' options='file=queries/sql-functions/updatepropertyfromlist.md'
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
// << alasql-function-updatepropertyfromlist-snippet
*/
export function registerFunctionUpdatePropertyFromList(): void {
  alasql.fn.updatePropertyFromList = function (currentValue: string, path: string, options: string[], propertyName: string) {
    const suggesterOptions = `['${options.join('\', \'')}']`;

    // Escape single quotes from path.
    path = path.replace(/'/g, '\\\'');

    let html = '<a class="qatt-link" ';
    html += 'onclick="';
    html += 'const fun = async() => { ';
    html += 'let newValue = (await ';
    html += '_qatt.ui.promptWithSuggestions';
    html += `(${suggesterOptions},${suggesterOptions})`;
    html += ');';
    html += `if(newValue !== null) {app.fileManager.processFrontMatter(app.vault.getAbstractFileByPath('${path}'), (f) => { f.${propertyName} = newValue; });}`;
    html += '}; fun();';
    html += '">';
    html += currentValue;
    html += '</a>';

    return html;
  };
}
