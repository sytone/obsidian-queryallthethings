import Handlebars, {type HelperDelegate, type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-capitalize' options=''

The `capitalize`\-helper will capitalize the first letter of the string.

{% raw %}

```handlebars
  {{{capitalize sentence}}}
```

{% endraw %}

when used with this context:

```
{
  sentence: "this is some sentence"
}
```

will result in:

```
This is some sentence
```

// << docs-handlebars-helper-capitalize
*/
export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
