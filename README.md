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

- 🚀 [Install Query all the things](https://github.com/sytone/obsidian-queryallthethings/wiki/Install-Query-All-the-Things)

---

## Development

### Tools

Development is done using VS Code, you are welcome to use any other editor just make sure the linting and format match.

### Dev Container

To make the process of developing simpler this repo has a dev container configuration. This means you can use a virtual container to work on changes and connect to that from any location in the browser or VSCode.

### Using a symlink to help test changes

New-Item -ItemType Junction -Target ".\dist" -Path "C:\obsidian\brainstore\.obsidian\plugins\qatt\"
