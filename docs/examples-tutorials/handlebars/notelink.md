---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: noteLink Helper
---

This uses a simple query to help show what the `noteLink`-helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'notepages/school/My Cool Page' AS link
template: |
  {{#each result}}
    {{noteLink link}}
  {{/each}}
```
{% endraw %}
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

%%This file is auto-generated. Do not edit. Generated at: Wed Mar 27 2024%%