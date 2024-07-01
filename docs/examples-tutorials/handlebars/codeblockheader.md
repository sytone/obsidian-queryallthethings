---

parent: Handlebars
grand_parent: Examples / Tutorials
title: codeBlockHeader Helper
---

This uses a simple query to help show what the codeBlockHeader helper does when rendering.

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