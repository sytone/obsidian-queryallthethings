import Handlebars, {type HelperDelegate, type HelperOptions} from 'handlebars';
/*
// >> id='docs-examples-handlebars-capitalize' options='file=templates/hb-helpers/capitalize.md'
title: capitalize
---

# {{ $frontmatter.title }}

This uses a simple query to help show what the Capitalize helper does when rendering.

### Example
````markdown
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```
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
