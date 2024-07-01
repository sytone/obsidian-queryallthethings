---
exclude: true
---

**SELECT TOP 5 * FROM obsidian_notes ORDER BY modified DESC**
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_notes ORDER BY modified DESC
template: |
  {{#each result}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
```

**Select top 5 and bottom five using multiple queries**
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_notes ORDER BY modified DESC;
  SELECT TOP 5 * FROM obsidian_notes ORDER BY modified ASC;
template: |
  Result[0]
  {{#each result.[0]}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
  Result[1]
  {{#each result.[1]}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
```











