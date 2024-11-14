import Handlebars, {type HelperOptions} from 'handlebars';

/*
// >> id='docs-handlebars-helper-markdowntable' options='file=templates/hb-helpers/markdowntable.md'
title: markdownTable
---

# {{ $frontmatter.title }}

The `markdownTable`\-helper will generate a markdown table based off the provided results.

```handlebars
  {{markdownTable result}}
```

will result in:

````markdown
```
````

// << docs-handlebars-helper-markdowntable
*/
/*
// >> id='docs-examples-handlebars-markdowntable' options='file=examples-tutorials/handlebars/markdowntable.md'
title: markdownTable Helper
---

This uses a simple query to help show what the markdownTable helper does when rendering.

### Example
````markdown
```qatt
query: |
  SELECT TOP 5 basename, modified FROM obsidian_notes ORDER BY modified DESC
template: |
  {{markdownTable result columns='[{"name": "Note Name"},{"name": "Modified", "align": "right" }]'}}
```
````
### Live in Vault
```qatt
query: |
  SELECT TOP 5 basename, modified FROM obsidian_notes ORDER BY modified DESC
template: |
  {{markdownTable result columns='[{"name": "Note Name"},{"name": "Modified", "align": "right" }]'}}
```

// << docs-examples-handlebars-markdowntable
*/
export function markdownTable(objectArray: any, options: HelperOptions) {
  const columns = options.hash?.columns ?? undefined; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  const columnObject = columns ? JSON.parse(columns) : undefined; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument

  // The columns parameter is optional. It is an array of column objects
  // in the same order as the objectArray. The column object has a name
  // property and optional alignment property. If the alignment property
  // is not set then the column will be left aligned.

  let table = '';

  const keys = Object.keys(objectArray[0] || {}); // eslint-disable-line @typescript-eslint/no-unsafe-argument
  const width = keys.length;
  table += '| ';

  if (columnObject) {
    for (let i = 0; i < width; i++) {
      table += columnObject[i].name + ' | '; // eslint-disable-line @typescript-eslint/restrict-plus-operands
    }
  } else {
    for (let h = 0; h < width; h++) {
      table += keys[h] + ' | ';
    }
  }

  table += '\n';
  table += '| ';

  if (columnObject) {
    for (let i = 0; i < width; i++) {
      if (columnObject[i].align && columnObject[i].align === 'right') {
        table += '---: | ';
      }

      if (columnObject[i].align && columnObject[i].align === 'center') {
        table += ':---: | ';
      }

      if (columnObject[i].align && columnObject[i].align === 'left') {
        table += ':--- | ';
      }

      if (!columnObject[i].align) {
        table += '--- | ';
      }
    }
  } else {
    for (let h = 0; h < width; h++) {
      table += '--- | ';
    }
  }

  table += '\n';

  for (const row of objectArray) {
    table += '| ';
    for (let i = 0; i < width; i++) {
      table += row[keys[i]] + ' | '; // eslint-disable-line @typescript-eslint/restrict-plus-operands
    }

    table += '\n';
  }

  return new Handlebars.SafeString(table);
}
