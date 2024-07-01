---

parent: Handlebars
grand_parent: Examples / Tutorials
title: noteLink Helper
---

This uses a simple query to help show what the `noteLink`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    {{noteLink link}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    {{noteLink link}}
  {{/each}}
```