---
layout: default
parent: Handlebars
grand_parent: Examples / Tutorials
title: obsidianHtmlInternalLink Helper
---

This uses a simple query to help show what the obsidianHtmlInternalLink helper does when rendering.

### Example

````markdown
{% raw %}
```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_markdown_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```
{% endraw %}
````

### Live in Vault

```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_markdown_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```

%%This file is auto-generated. Do not edit. Generated at: Tue Jan 02 2024%%