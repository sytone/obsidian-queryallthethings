---
task_status: x
exclude: true
---

- [ ] Not Done
- [x] Done
- [x] Also Done


```qatt
query: |
  SELECT pageProperty('task_status') AS TaskStatus
template: |
  {{#each result}}
    The page property 'task_status' is set to {{TaskStatus}}
  {{/each}}
```



```qatt
query: |
  SELECT TOP 5 *
  FROM obsidian_markdown_tasks
  WHERE status = pageProperty('task_status')
template: |
  {{#each result}}
    - {{page}}: {{text}}
  {{/each}}
```
