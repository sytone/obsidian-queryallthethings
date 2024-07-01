---

parent: Handlebars
grand_parent: Examples / Tutorials
title: taskCheckbox Helper
---

This uses a simple query to help show what the `taskCheckbox`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckbox 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{taskCheckbox 'text'}}
  {{/each}}
```