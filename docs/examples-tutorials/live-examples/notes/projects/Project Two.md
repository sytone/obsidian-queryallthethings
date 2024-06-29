---
nav_exclude: true
notetype: project
version: 2
project-name: Project Two
created: 2023-01-01T09:32:16-08:00
tags:
  - project
  - area/career
  - project/projtwo
subtitle: This is project one which is very important
aliases:
  - projone
status: In Progress
area: Fun
priority: "3"
---

# Project Two

## Project Info

This is related to [[Project One]]

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

- [ ] Fill out overview for Project Two

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
    OR text LIKE '%#projtwo%'
    OR text LIKE '%#project/projtwo%'
template: |
  | File | Task |
  | ---- | ---- |
  {{#each result}}
  |{{obsidianHtmlInternalLink page name}} | {{text}}|
  {{/each}}
postRenderFormat: micromark
```
