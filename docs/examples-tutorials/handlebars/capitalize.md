---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: Capitalize Helper
---

This uses a simple query to help show what the Capitalize helper does when rendering.

### Example
````markdown
{% raw %}
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```
{% endraw %}
````
### Live in Vault
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Wed Mar 27 2024%%