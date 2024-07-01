---
parent: Examples / Tutorials
title: Using updatePropertyFromList
---
# {{ $frontmatter.title }}

The updatePropertyFromList SQL function generates a HTML link that has a onclick command that when clicked will update a property on a specified note. It will prompt the user with a list of options. This is good for handling note properties in a consistent way.

The example below works with a set of notes that are used to track projects and states. It makes the following assumptions.

- There are properties on the project notes for `project-name`, `status`, `area` and `priority`.
- Project notes are identified by a property called `notetype` with a value of `project`

The following query will return all the tasks and as part of the result the updateStatus, updateArea and updatePriority columns contain the HTML link with the onclick handler. It excludes any notes that have a status of `Archive`, `Done` or `Discarded` or are under `%9 DataStores/Templates%`

```sql
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
  AND path NOT LIKE '%9 DataStores/Templates%'
  AND frontmatter->status <> 'Archive'
  AND frontmatter->status <> 'Done'
  AND frontmatter->status <> 'Discarded'
ORDER BY status
```

To render the output the following template can be used, note that the update columns with the HTML in them have three (3) braces either side. This is to ensure the handlebars renderer does not process the HTML already created.


```handlebars
| Project | Status | Priority | Area |
| ------- | ------ | -------- | ---- |
{{#each result}}
  | [[{{project}}]] | {{{updateStatus}}}  | {{{updatePriority}}} | {{{updateArea}}} |
{{/each}}

```


The complete codeblock looks like this.


````markdown
```qatt
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
    AND path NOT LIKE '%9 DataStores/Templates%'
    AND frontmatter->status <> 'Archive'
    AND frontmatter->status <> 'Done'
    AND frontmatter->status <> 'Discarded'
  ORDER BY status
template: |
  | Project | Status | Priority | Area |
  | ------- | ------ | -------- | ---- |
  {{#each result}}
    | [[{{project}}]] | {{{updateStatus}}}  | {{{updatePriority}}} | {{{updateArea}}} |
  {{/each}}
```
````


When the page is rendered you will see a list of all the notes marked with a type called `project` and in the Status, Priority and Area fields a HTML link that when clicked will show a prompt with the possible options.
