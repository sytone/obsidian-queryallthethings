---

parent: Handlebars Helpers
grand_parent: Using Templates
title: capitalize
---

# {{ $frontmatter.title }}

This uses a simple query to help show what the Capitalize helper does when rendering.

### Example
````markdown
```qatt
query: |
  SELECT 'word' AS LowerCaseWord
template: |
  {{#each result}}
    Value from result: **{{LowerCaseWord}}**
    Value using capitalize: **{{capitalize LowerCaseWord}}**
  {{/each}}
```
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