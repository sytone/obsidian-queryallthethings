---

parent: Examples / Tutorials
title: Active tasks grouped by day
exclude: true
---
# {{ $frontmatter.title }}

This example uses the `obsidian_markdown_tasks` table to get all the tasks that have a due date and then uses the `#group` helper in handlebars to render the results.

It shows moment being used to validate and parse the dates for output. I also shows a more complex output where we are rendering the results direct to html with attributes and callbacks to enable more integration in Obsidian. The `postRenderFormat` property tells the rendering engine not to do any post processing to convert markdown to HTML as the output is already in HTML.

## Tasks for query

- [ ] Task number 1 📅 2023-11-11 📜
- [ ] Task number 2 📅 2023-11-11 📜
- [ ] Task number 3 📅 2023-10-11 📜
- [ ] Task number 4 📅 2023-10-12 📜

## Live Result

```qatt
postRenderFormat: html
query: |
  SELECT
    IIF(moment(dueDate, 'YYYY-MM-DD', true).isValid(), moment(dueDate)->format("MMMM Do, YYYY"), 'No Due Date') AS Month,
    page,
    text,
    status,
    line,
    tags,
    doneDate,
    priority
  FROM obsidian_tasks
  WHERE status != 'x'
    and text LIKE '%📜%'
    and moment(dueDate, 'YYYY-MM-DD', true).isValid()
  ORDER BY dueDate asc, priority desc
template: |
  {{#group result by="Month"}}
  <h4>{{ value }}</h4>
      <ul class='contains-task-list'>
      {{#each items}}
      <li class='task-list-item plugin-tasks-list-item'> {{ taskCheckbox this }} {{#if (isHighPriority priority)}}<strong>{{/if}} {{#micromark inline="true"}} {{text}} [[{{page}}|📝]] {{/micromark}} {{#if (isHighPriority priority)}}</strong>{{/if}}</li>
      {{/each}}
      </ul>
  {{/group}}
```

