import Handlebars, {type HelperOptions} from 'handlebars';

/*
// >> id='docs-handlebars-helper-markdowntable' options='file=templates/hb-helpers/markdowntable.md'
title: markdownTable
---

# {{ $frontmatter.title }}

The `markdownTable`\-helper will generate a markdown table based off the provided results.

There is a option to specify the columns, this allows you to change the heding and set alignment. To set these you need to create a JSON blob and add it to the handlebars helper under `columns`. If you do this it will use the order in the JSON file to replace the headings and set alignment, so if you have 5 columns being returned then you need to have 5 JSON objects in the JSON array and they will be applied in the same order the query returns the columns. Avoid using the wildcard to return columns in this case. 

In the example below the query is `SELECT TOP 5 basename, modified FROM obsidian_notes ORDER BY modified DESC`. This mean we have two columns returned in the order of `basename` and then `modified`. To change the titles in the table to be *nicer* you can create a JSON array with two objects, as alignment is optional you can skip adding this. The required field in the object is `name`. So `{ "name": "This is the better Title" }` is valid for a column replacement without an alignment, in this case it will be left aligned. 

Alignment options are `left`, `right` and `center`, so if you want to change the alignment of a column add the `align` field to the JSON object after `name`. So using the example above to makeit center aligned you would use `{ "name": "This is the better Title", "align": "center" }`.

```handlebars
{{markdownTable result columns='[{"name": "<VALUE>" [, "align": "left|center|right"] },{"name": "<VALUE>" [, "align": "left|center|right"] }, ...]'}}
```

## Example

```handlebars
{{markdownTable result columns='[{"name": "Note Name"},{"name": "Modified", "align": "right" }]'}}
```

will result in:

````markdown
| Note Name | Modified | 
| --- | ---: | 
| Note 1 | 1732050853318 | 
| Note 2 | 1732049773183 | 
| Note 3 | 1732044078501 | 
| Note 4 | 1732043909292 | 
| Note 5 | 1732043884688 |
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
