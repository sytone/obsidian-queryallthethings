---

parent: Handlebars
grand_parent: Examples / Tutorials
title: obsidianHtmlInternalLink Helper
---
# {{ $frontmatter.title }}

This uses a simple query to help show what the obsidianHtmlInternalLink helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```