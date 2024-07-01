import Handlebars, {type HelperOptions} from 'handlebars';

type IMap = Record<string, {value: string; items: Array<Record<string, any>>}>;
/*
// >> id='docs-handlebars-helpers-group' options='file=templates/hb-helpers/group.md'
title: group
---
# {{ $frontmatter.title }}

The `group`\-helper will group the result by the specified column.

```handlebars
{{{#group result by="column_name"}}}
  column_name value is specified by {{value}}
  collection of items in the group is specified by {{items}}
{{/group}}
```

See the [group](../../examples-tutorials/handlebars/group) page for a full example.

// << docs-handlebars-helpers-group
*/

/*
// >> id='docs-examples-handlebars-group' options='file=examples-tutorials/handlebars/group.md'
title: Group Helper
---

This example uses the `qatt.ReferenceCalendar` table to get all the dates for February in the current year and groups by the `weekOfYear` value.

The render helper `group` then takes the result of the query and does a group by `weekOfYear`. Inside the `group` helper the value of the grouping property can be accessed by using `{{value}}`. In the example below it is being used as the 4th level header value.

The items in the group are then available via the `items` property. Below this is iterated though to get the `date` value and if it `isWeekend`. These are then used to display different outputs if `isWeekend` is true.

### Example
````markdown
```qatt
query: |
  SELECT *
  FROM qatt.ReferenceCalendar
  WHERE year = moment()->year()
  AND month = 2
template: |
  {{#group result by="weekOfYear"}}
  #### Week {{value}}
  {{#each items}}
  {{#if isWeekend}}
  - {{date}} 🥳🎂🍾🥂
  {{else}}
  - {{date}} ⚒️
  {{/if}}
  {{/each}}
  {{/group}}
```
````
### Live in Vault
```qatt
query: |
  SELECT *
  FROM qatt.ReferenceCalendar
  WHERE year = moment()->year()
  AND month = 2
template: |
  {{#group result by="weekOfYear"}}
  #### Week {{value}}
  {{#each items}}
  {{#if isWeekend}}
  - {{date}} 🥳🎂🍾🥂
  {{else}}
  - {{date}} ⚒️
  {{/if}}
  {{/each}}
  {{/group}}
```

// << docs-examples-handlebars-group
*/

export function group(list: any, options: HelperOptions) {
  const fn = options.fn;
  const inverse = options.inverse;
  const groupByProperty = options.hash?.by as string | undefined;
  const keys: string[] = [];
  const groups: IMap = {};

  if (!groupByProperty || !list || list.length === 0) {
    return inverse(this);
  }

  // Gets the value of the property name specified by groupByProperty. This comes
  // from the by part of the helper.
  function get(object: Record<string, any>, groupByProperty: string | undefined) {
    if (groupByProperty === undefined) {
      return undefined;
    }

    const parts = groupByProperty.split('.');
    const last = parts.pop();

    while ((groupByProperty = parts.shift())) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      object = object[groupByProperty];

      if (object === null) {
        return;
      }
    }

    if (last === undefined) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return object[last];
  }

  function groupKey(item: Record<string, any>) {
    const key = get(item, groupByProperty) as string;

    if (!keys.includes(key)) {
      keys.push(key);
    }

    if (!groups[key]) {
      groups[key] = {
        value: key,
        items: [],
      };
    }

    groups[key].items.push(item);
  }

  for (const element of list) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    groupKey(element);
  }

  let result = '';

  for (const element of keys) {
    result += fn(groups[element]);
  }

  return result;
}
