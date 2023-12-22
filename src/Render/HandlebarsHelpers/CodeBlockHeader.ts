import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-codeblockheader' options='file=templates/hb-helpers/codeblockheader.md'
title: codeBlockHeader
---

The `codeBlockHeader`\-helper will insert the three back ticks into the resulting markdown with the name specified as a parameter as the code block type.

{% raw %}

```handlebars
  {{codeBlockHeade 'text'}}
```

{% endraw %}

will result in:

````markdown
```text
````

// << docs-handlebars-helper-codeblockheader
*/
/*
// >> id='docs-examples-handlebars-codeblockheader' options='file=examples-tutorials/handlebars/codeblockheader.md'
title: codeBlockHeader Helper
---

This uses a simple query to help show what the codeBlockHeader helper does when rendering.

### Example
````markdown
{% raw %}
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{codeBlockHeader 'text'}}
    {{code}}
    {{codeBlockFooter}}
  {{/each}}
```
{% endraw %}
````
### Live in Vault
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{codeBlockHeader 'text'}}
    {{code}}
    {{codeBlockFooter}}
  {{/each}}
```

// << docs-examples-handlebars-codeblockheader
*/
export function codeBlockHeader(value: string) {
  return new Handlebars.SafeString('```' + value);
}
