This note contains live examples of:

- [using-updatepropertyfromlist](../using-updatepropertyfromlist.md)


## Project list

Click on the Status to update it using the suggester.

```qatt
postRenderFormat: micromark
query: |
  SELECT
    frontmatter->[project-name] AS project,
    frontmatter->status AS status,
    frontmatter->priority AS priority,
    frontmatter->area AS area,
    path,
    updatePropertyFromList(frontmatter->status, path, @['Active','Done','Todo','In Progress','Waiting','Archive'], 'status') AS updateStatus,
    updatePropertyFromList(frontmatter->area, path, @['Health', 'Family', 'Fun', 'Social', 'Career', 'Financial', 'Learning'], 'area') AS updateArea,
    updatePropertyFromList(frontmatter->priority, path, @[1, 2, 3], 'priority') AS updatePriority
  FROM obsidian_notes
  WHERE frontmatter->notetype = 'project'
    AND frontmatter->status <> 'Archive'
    AND frontmatter->status <> 'Done'
  ORDER BY status
template: |
  | Project | Status | Priority | Area |
  | ------- | ------ | -------- | ---- |
  {{#each result}}
    | [[{{project}}]] | {{{updateStatus}}}  | {{{updatePriority}}} | {{{updateArea}}} |
  {{/each}}
```
