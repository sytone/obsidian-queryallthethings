---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: obsidian Helper
---

This uses a simple query to help show what the `obsidian`-helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#obsidian inline="true"}}}{{{code}}}{{{/obsidian}}}
  {{/each}}
```
{% endraw %}
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

%%This file is auto-generated. Do not edit. Generated at: Thu Mar 14 2024%%