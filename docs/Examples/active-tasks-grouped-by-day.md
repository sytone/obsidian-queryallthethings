---
nav_order: 4
layout: default
parent: Examples
title: Active tasks grouped by day
---

This example uses the `dataview_tasks` table to get all the tasks that have a due date and then uses the `#group` helper in handlebars to render the results.

It shows moment being used to validate and parse the dates for output. I also shows a more complex output where we are rendering the results direct to html with attributes and callbacks to enable more integration in Obsidian. The `postRenderFormat` property tells the rendering engine not to do any post processing to convert markdown to HTML as the output is already in HTML.

{% raw %}

````markdown
```qatt
postRenderFormat: html
query: |
  SELECT
    IIF(moment(dueDate, 'YYYY-MM-DD', true).isValid(), moment(dueDate)->format("MMMM Do, YYYY"), 'No Due Date') AS Month,
    page,
    task,
    status,
    line,
    tags,
    doneDate,
    priority
  from dataview_tasks
  where status != 'x'
    and task LIKE '%📜%'
    and moment(dueDate, 'YYYY-MM-DD', true).isValid()
  ORDER BY dueDate asc, priority desc
template: |
    {{#group result by="Month"}}
     <h4>{{ value }}</h4>
        <ul class='contains-task-list'>
        {{#each items}}
        <li class='task-list-item plugin-tasks-list-item'> {{ taskcheckbox this }} {{#if (isHighPriority priority)}}<strong>{{/if}} {{#micromark inline="true"}} {{task}} [[{{page}}|📝]] {{/micromark}} {{#if (isHighPriority priority)}}</strong>{{/if}}</li>
        {{/each}}
        </ul>
    {{/group}}
```
````

{% endraw %}
