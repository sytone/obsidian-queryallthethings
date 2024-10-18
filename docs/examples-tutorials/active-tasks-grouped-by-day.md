---

parent: Examples / Tutorials
title: Active tasks grouped by day
---
# {{ $frontmatter.title }}

This example uses the `obsidian_markdown_tasks` table to get all the tasks that have a due date and then uses the `#group` helper in handlebars to render the results.

It shows moment being used to validate and parse the dates for output. I also shows a more complex output where we are rendering the results direct to html with attributes and callbacks to enable more integration in Obsidian. The `postRenderFormat` property tells the rendering engine not to do any post processing to convert markdown to HTML as the output is already in HTML.

````markdown
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
      <li class='task-list-item plugin-tasks-list-item'> {{ taskcheckbox this }} {{#if (isHighPriority priority)}}<strong>{{/if}} {{#micromark inline="true"}} {{text}} [[{{page}}|📝]] {{/micromark}} {{#if (isHighPriority priority)}}</strong>{{/if}}</li>
      {{/each}}
      </ul>
  {{/group}}
```
````

## Using Query and Template files

If you want to use this in multiple places and only have to update the template or query in one you can use queries files and template files. Create the two files below and add the following code block to the pages you want to see the results on. Make sure you update the path as needed.

### Code Block

````markdown
```qatt
postRenderFormat: html
queryFile: 9 DataStores/qatt/task_list_query_active_with_duedate.md
templateFile: 9 DataStores/qatt/task_list_grouping_template.md
```
````

### Query File (task_list_query_active_with_duedate.md)

```sql
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
```

### Template File (task_list_grouping_template.md)
```handlebars
{{#group result by="Month"}}
 <h4>{{ value }}</h4>
    <ul class='contains-task-list'>
    {{#each items}}
    <li class='task-list-item plugin-tasks-list-item'> {{ taskcheckbox this }} {{#if (isHighPriority priority)}}<strong>{{/if}} {{#micromark inline="true"}} {{text}} [[{{page}}|📝]] {{/micromark}} {{#if (isHighPriority priority)}}</strong>{{/if}}</li>
    {{/each}}
    </ul>
{{/group}}
```
