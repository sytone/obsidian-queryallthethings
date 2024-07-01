---
exclude: true
---

### New Tables - Note these will be the main validation and target moving forward.
#### obsidian_notes
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_notes ORDER BY modified DESC
template: |
  {{#each result}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
```

#### obsidian_lists
```qatt
query: |
  SELECT TOP 2 * FROM obsidian_lists ORDER BY modified DESC
template: |
  {{#each result}}
  Path: {{path}}
  Text: {{text}}
  Status: '{{status}}'
  Line-Column: '{{line}}-{{column}}'


  {{/each}}
```

#### obsidian_tasks
```qatt
query: |
  SELECT TOP 2 * FROM obsidian_tasks ORDER BY modified DESC
template: |
  {{#each result}}
  Path: {{path}}
  Text: {{text}}
  Status: '{{status}}'
  Task: '{{task}}'
  Line: '{{line}}'


  {{/each}}
```




### Internal Tables

#### qatt.ReferenceCalendar

```qatt
query: |
  SELECT TOP 5 * FROM qatt.ReferenceCalendar
template: |
  | Date | dayOfWeek | weekOfYear |
  | ---- | --------- | ---------- |
  {{#each result}}
  | {{date}} | {{dayOfWeek}} | {{weekOfYear}} |
  {{/each}}
```

### Previous tables names - These were not in memory tables, in future they will be removed to enable better/faster caching
#### obsidian_markdown_notes
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_markdown_notes ORDER BY modified DESC
template: |
  {{#each result}}
  [[{{basename}}]] - Last Updated: {{formatDate modified}}
  {{/each}}
```
#### obsidian_markdown_files - DEAD
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_markdown_files
template: |
  {{stringify result}}

```

#### obsidian_lists
```qatt
query: |
  SELECT TOP 2 * FROM obsidian_markdown_lists ORDER BY modified DESC
template: |
  {{#each result}}
  Path: {{path}}
  Text: {{text}}
  Status: '{{status}}'
  Line-Column: '{{line}}-{{column}}'


  {{/each}}
```

#### obsidian_tasks
```qatt
query: |
  SELECT TOP 2 * FROM obsidian_markdown_tasks ORDER BY modified DESC
template: |
  {{#each result}}
  Path: {{path}}
  Text: {{text}}
  Status: '{{status}}'
  Task: '{{task}}'
  Line: '{{line}}'


  {{/each}}
```

