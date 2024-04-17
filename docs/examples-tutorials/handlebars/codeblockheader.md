---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: codeBlockHeader Helper
---

This uses a simple query to help show what the codeBlockHeader helper does when rendering.

### Example
````markdown
{% raw %}
```qatt
query: |
  SELECT 'something to render in a code block. ' AS code
template: |
  {{#each result}}
    {{codeBlockHeader 'text'}}
    {{code}}
    {{codeBlockFooter}}
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
    {{codeBlockHeader 'text'}}
    {{code}}
    {{codeBlockFooter}}
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Tue Apr 16 2024%%