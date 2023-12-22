import Handlebars, {type HelperOptions} from 'handlebars';

/*
// >> id='docs-handlebars-helper-stringify' options='file=templates/hb-helpers/stringify.md'
title: stringify value
---
The `stringify`\-helper will convert the referenced object to a JSON string.

{% raw %}

```handlebars
  {{{stringify complexObject}}}
```

{% endraw %}

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
  return new Handlebars.SafeString(JSON.stringify(value, null, 2));
}
