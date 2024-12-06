import alasql from 'alasql';

/*
// >> id='alasql-function-updatepropertyfromprompt-snippet' options='file=queries/sql-functions/updatepropertyfromprompt.md'
title: updatePropertyFromPrompt(value)
---
# {{ $frontmatter.title }}

The `updatePropertyFromPrompt` function will return a link that when clicked will prompt the user to enter a value.
The user can then enter a value and the property will be updated on the file.

````markdown
```qatt
query: SELECT TOP 1 updatePropertyFromPrompt('Enter email alias', frontmatter->email, path, 'email') AS updateEmail FROM obsidian_notes
template: |
  {{#each result}}{{updateEmail}}{{/each}}
```
````

will result in:

```text
<a class="qatt-link" onclick="const fun = async() => { let newValue = (await _qatt.ui.promptForInput('Enter alias','alias',false,false));if(newValue !== null &amp;&amp; newValue !== undefined ) {app.fileManager.processFrontMatter(app.vault.getAbstractFileByPath('contacts/person.md'), (f) => { f.email = newValue; });}}; fun();">alias</a>
```

The links by default will be dotted and not underlined. This can be changed by adding a snippet for the CSS class `qatt-link` to a CSS file.
// << alasql-function-updatepropertyfromprompt-snippet
*/
export function registerFunctionUpdatePropertyFromPrompt(): void {
  alasql.fn.updatePropertyFromPrompt = function (promptText: string, currentValue: string, path: string, propertyName: string, multiLine: boolean) { // eslint-disable-line max-params
    if (multiLine === undefined) {
      multiLine = false;
    }

    // Escape single quotes from path.
    path = path.replace(/'/g, '\\\'');

    const multiLineValue = multiLine ? 'true' : 'false';

    let html = '<a class="qatt-link" ';
    html += 'onclick="';
    html += 'const fun = async() => { ';
    html += 'let newValue = (await ';
    html += '_qatt.ui.promptForInput';
    html += `('${promptText}','${currentValue}',false,${multiLineValue})`;
    html += ');';
    html += `if(newValue !== null && newValue !== undefined ) {app.fileManager.processFrontMatter(app.vault.getAbstractFileByPath('${path}'), (f) => { f.${propertyName} = newValue; });}`;
    html += '}; fun();';
    html += '">';
    html += currentValue;
    html += '</a>';

    return html;
  };
}
