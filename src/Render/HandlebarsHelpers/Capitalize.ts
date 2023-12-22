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
/*
// >> id='docs-examples-handlebars-capitalize' options='file=examples-tutorials/handlebars/capitalize.md'
title: Capitalize Helper
---

This uses a simple query to help show what the Capitalize helper does when rendering.

### Example
````markdown
{% raw %}
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```
{% endraw %}
````
### Live in Vault
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```

// << docs-examples-handlebars-capitalize
*/
export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
