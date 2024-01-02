---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: pad Helper
---

This uses a simple query to help show what the pad helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{pad 'text'}}
  {{/each}}
```
{% endraw %}
````

### Live in Vault

```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{pad 'text'}}
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Tue Jan 02 2024%%