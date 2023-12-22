import {type HelperOptions} from 'handlebars';

type IMap = Record<string, {value: string; items: Array<Record<string, any>>}>;
/*
// >> id='docs-handlebars-helpers-group' options='file=templates/hb-helpers/group.md'
title: group
---

The `group`\-helper will group the result by the specified column.

{% raw %}

```handlebars
{{{#group result by="column_name"}}}
  column_name value is specified by {{value}}
  collection of items in the group is specified by {{items}}
{{/group}}
```

{% endraw %}

See the [group](examples/handlebars/group) page for a full example.

// << docs-handlebars-helpers-group
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
