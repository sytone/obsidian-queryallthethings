import Handlebars, {type HelperOptions} from 'handlebars';

/*
// >> id='docs-handlebars-helper-codeblockfooter' options='file=templates/hb-helpers/codeblockfooter.md'
title: codeBlockFooter
---

# {{ $frontmatter.title }}

The `codeBlockFooter`\-helper will insert the three back ticks into the resulting markdown.

```handlebars
  {{codeBlockFooter}}
```

will result in:

````markdown
```
````

// << docs-handlebars-helper-codeblockfooter
*/
/*
// >> id='docs-examples-handlebars-codeblockfooter' options='file=examples-tutorials/handlebars/codeblockfooter.md'
title: codeBlockFooter Helper
---

This uses a simple query to help show what the codeBlockFooter helper does when rendering.

### Example
````markdown
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

// << docs-examples-handlebars-codeblockfooter
*/
export function codeBlockFooter() {
  return new Handlebars.SafeString('```');
}
