---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: flexibleTaskCheckbox Helper
---

This uses a simple query to help show what the `flexibleTaskCheckbox`-helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{flexibleTaskCheckbox 'text'}}
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
    {{flexibleTaskCheckbox 'text'}}
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Wed Mar 27 2024%%