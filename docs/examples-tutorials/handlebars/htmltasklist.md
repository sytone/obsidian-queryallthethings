---

parent: Handlebars
grand_parent: Examples / Tutorials
title: htmlTaskList Helper
---

This uses a simple query to help show what the `htmlTaskList`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{htmlTaskList 'text'}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{htmlTaskList 'text'}}
  {{/each}}
```