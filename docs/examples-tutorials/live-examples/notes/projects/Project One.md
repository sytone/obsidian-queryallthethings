---
nav_exclude: true
notetype: project
version: 2
project-name: Project One
created: 2023-01-01T09:32:16-08:00
tags:
  - project
  - area/career
  - project/projone
subtitle: This is project one which is very important
aliases:
  - projone
status: Waiting
area: Career
priority: "2"
---

# Project One

## Project Info

## Thoughts

## Resources

## Review questions

- Problem Statement
- Success Metrics
- In Scope
- Out of Scope
- Risks
- Open Questions

## Tasks

- [ ] Fill out overview for Project One
- [ ] Fill out overview for #project/projone

## Backlinks

```qatt
query: |
  SELECT path, getNoteName(path) AS name, moment(stat->mtime).format('YYYY-MM-DD') AS LastUpdate
  FROM obsidian_notes
  WHERE content LIKE '%'+noteFileName()+'%' AND getNoteName(path) <> noteFileName()
template: |
  | File | Last Modified |
  | ---- | ------------- |
  {{#each result}}
  |{{obsidianHtmlInternalLink path name}} | {{LastUpdate}} |
  {{/each}}
postRenderFormat: micromark
```

### Related Tasks

```qatt
query: |
  SELECT page, getNoteName(page) AS name, text
  FROM obsidian_markdown_tasks
  WHERE
    text LIKE '%'+noteFileName()+'%'
    OR text LIKE '%#projone%'
    OR text LIKE '%#project/projone%'
template: |
  | File | Task |
  | ---- | ---- |
  {{#each result}}
  |{{obsidianHtmlInternalLink page name}} | {{text}}|
  {{/each}}
postRenderFormat: micromark
```

