# Query All The Things

<p align="center">
    <a href="https://github.com/sytone/obsidian-queryallthethings/releases/latest">
  <img src="https://img.shields.io/github/manifest-json/v/sytone/obsidian-queryallthethings?color=blue">
 </a>
    <img src="https://img.shields.io/github/release-date/sytone/obsidian-queryallthethings">
 <a href="https://github.com/sytone/obsidian-queryallthethings/blob/main/LICENSE">
  <img src="https://img.shields.io/github/license/sytone/obsidian-queryallthethings">
 </a>
 <img src="https://img.shields.io/github/downloads/sytone/obsidian-queryallthethings/total">
 <a href="https://github.com/sytone/obsidian-queryallthethings/issues">
  <img src="https://img.shields.io/github/issues/sytone/obsidian-queryallthethings">
 </a>
 <br>
 <img src="https://img.shields.io/tokei/lines/github/sytone/obsidian-queryallthethings">
 <a href="https://www.codefactor.io/repository/github/sytone/obsidian-queryallthethings/stats">
  <img src="https://img.shields.io/codefactor/grade/github/sytone/obsidian-queryallthethings">
 </a>
 <a href="https://sytone.github.io/obsidian-queryallthethings/lcov-report/">
  <img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/sytone/a2879612aa47b6364392d94cae882c50/raw/obsidian-queryallthethings_coverage.json">
 </a>
</p>

<div align="center">

Query All the Things is a flexible way to query and render data in <a href="https://obsidian.md">Obsidian</a> and from other Obsidian plugins
</div>

---

### Features

- Use SQL based queries that are extensible and handle JSON and objects.
- Query any data collection found in the Obsidian API.
- Query data stored in DataView as well as cached view of DataView Data like tasks.
- Render using handlebar templates in HTML or Markdown
- Use custom handle bar helpers and/or provide your own.

---

### Getting started

Documentation on installing the plugin and using it can be found at (https://sytone.github.io/obsidian-queryallthethings/)[https://sytone.github.io/obsidian-queryallthethings/]


## Getting Started - I don't need documentation

Well, in short after you have installed the plugin make a code block like the following example, this will list all your tasks that are not done and group them by the month when they are due.

If you want more details.... Read the documentation, or reverse engineer the code base. Your Choice!

Note: This plugin currently has a hard dependency on DataView, make sure it is installed as well.

````markdown
```qatt
# logLevel: debug
query: |
  SELECT moment(dueDate)->format("MMMM Do, YYYY") AS Month, page, task, status, line, tags, doneDate, priority
  from tasks
  where status != 'x'
  ORDER BY dueDate asc
template: |
    {{#group result by="Month"}}
      <h4>{{ value }}</h4>
      <ul class='contains-task-list'>
      {{#each items}}
        <li class='task-list-item plugin-tasks-list-item'> {{ taskcheckbox this }} {{#markdown2}} {{task}} [[{{page}}|📝]] {{/markdown2}}</li>
      {{/each}}
      </ul>
    {{/group}}
```
````

---
