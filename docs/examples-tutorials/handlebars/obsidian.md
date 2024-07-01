---

parent: Handlebars
grand_parent: Examples / Tutorials
title: obsidian Helper
---

This uses a simple query to help show what the `obsidian`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#obsidian inline="true"}}}{{{code}}}{{{/obsidian}}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#obsidian inline="true"}}}{{{code}}}{{{/obsidian}}}
  {{/each}}
```