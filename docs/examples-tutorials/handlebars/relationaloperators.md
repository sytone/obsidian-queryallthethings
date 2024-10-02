---

parent: Handlebars
grand_parent: Examples / Tutorials
title: Relational Operators Helper
---

This uses a simple query to help show what the Relational Operators helpers does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT TOP 10 path, name, frontmatter->type AS page_type
  FROM obsidian_notes
  WHERE frontmatter->type
template: |
  ## ✅ Next actions
  {{#each result}}
    - [[{{name}}]] - {{page_type}} -
  {{#eq page_type 'journal'}}
    <!-- When the two values are equal -->
    Journal Page!!!!
  {{else}}
    <!-- When the two values are not equal -->
    Not Journal Page
  {{/eq}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT TOP 10 path, name, frontmatter->type AS page_type
  FROM obsidian_notes
  WHERE frontmatter->type
template: |
  ## ✅ Next actions
  {{#each result}}
    - [[{{name}}]] - {{page_type}} -
  {{#eq page_type 'Journal'}}
    <!-- When the two values are equal -->
    Journal Page!!!!
  {{else}}
    <!-- When the two values are not equal -->
    Not Journal Page
  {{/eq}}
  {{/each}}
```