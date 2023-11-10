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
</p>

***Execute flexible SQL base queries against your data in [Obsidian](https://obsidian.md) and render it how you want using Handlebars templates.***

---

## Features

- Use SQL based queries that are extensible and handle JSON and objects.
- Query any data collection found in the Obsidian API.
- Query data stored in DataView as well as cached view of DataView Data like tasks.
- Render using handlebar templates in HTML or Markdown
- Use custom handle bar helpers and/or provide your own.

---

## Roadmap and Issues

Look at the [Qatt Project](https://github.com/users/sytone/projects/4) to see what is in progress or planned. Please make a issue if you have a problem or want to add/request a new feature. Open to PRs at any point.

---

## Getting started

Documentation on installing the plugin and using it can be found at [https://sytone.github.io/obsidian-queryallthethings/](https://sytone.github.io/obsidian-queryallthethings/)

## Getting Started - I don't need documentation

Well, in short after you have installed the plugin make a code block like the following example, this will list all your tasks that are not done and group them by the month when they are due.

If you want more details.... Read the documentation, or reverse engineer the code base. Your Choice!

Note: This plugin currently has a soft dependency on DataView, make sure it is installed if you want to use the dataview backed tables.

````markdown
```qatt
query: |
  SELECT TOP 5 * FROM obsidian_markdown_notes ORDER BY stat->mtime DESC
template: |
  {{#each result}}
   - [[{{path}}\|{{basename}}]]
  {{/each}}
```
````

---
