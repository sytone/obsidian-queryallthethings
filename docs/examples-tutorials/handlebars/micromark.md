---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: micromark Helper
---

This uses a simple query to help show what the `micromark`-helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#micromark inline="true"}}}{{{code}}}{{{/micromark}}}
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
    {{{#micromark inline="true"}}}{{{code}}}{{{/micromark}}}
  {{/each}}
```