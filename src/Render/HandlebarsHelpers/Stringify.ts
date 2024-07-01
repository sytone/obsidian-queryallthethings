import Handlebars, {type HelperOptions} from 'handlebars';

/*
// >> id='docs-handlebars-helper-stringify' options='file=templates/hb-helpers/stringify.md'
title: stringify value
---
# {{ $frontmatter.title }}

The `stringify`\-helper will convert the referenced object to a JSON string. If a cyclical object is used the helper will return `[Cyclical]` for the nested instances to prevent infinite recursion.

```handlebars
  {{{stringify complexObject}}}
```

when used with this context:

```json
{
  complexObject: {
    "this": "is",
    "a": "complex",
    "object": "with",
    "lots": "of",
    "things": "in",
    "it": "!"
  }
}
```

will result in:

```text
{
  complexObject: {
    "this": "is",
    "a": "complex",
    "object": "with",
    "lots": "of",
    "things": "in",
    "it": "!"
  }
}
```

// << docs-handlebars-helper-stringify
*/
export function stringify(value: any) {
  const seenObjects: any[] = [];
  function inspectElement(_key: any, value: any): any {
    if (detectCycle(value)) {
      return '[Cyclical]';
    }

    return value;
  }

  function detectCycle(object: any): boolean {
    if (object && (typeof object === 'object')) {
      for (const r of seenObjects) {
        if (r === object) {
          return true;
        }
      }

      seenObjects.push(object);
    }

    return false;
  }

  return new Handlebars.SafeString(JSON.stringify(value, inspectElement, 2));
}
