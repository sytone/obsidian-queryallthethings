---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: htmlTaskList Helper
---

This uses a simple query to help show what the `htmlTaskList`-helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{htmlTaskList 'text'}}
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
    {{htmlTaskList 'text'}}
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Thu Mar 14 2024%%