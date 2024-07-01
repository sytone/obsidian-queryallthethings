---

parent: Examples / Tutorials
title: Replace target path example
---
# {{ $frontmatter.title }}

This example shows how the replace target path function works.

As all output is converted to HTML so Obsidian will render it we need to make sure we do not have that process run if we want to create a markdown file. To so this we need to set `postRenderFormat` to `html` so the render engine knows the result is pre created HTML and not to run a markdown to HTML converter on the result but just output as is.

````markdown
```qatt
query: |
  SELECT TOP 10
    basename
  FROM obsidian_notes
  ORDER BY stat->mtime DESC
template: |
  {{#each result}}
  - {{basename}}
  {{/each}}
postRenderFormat: html
replaceTargetPath: examples-tutorials/generated-top-ten-notes.md
replaceType: always
```
````

## Live Example

Open docs in Obsidian to see this example live.

View this page in source mode to see the code block below this line that generates the included file.

```qatt
query: |
  SELECT TOP 10
    basename
  FROM obsidian_notes
  ORDER BY stat->mtime DESC
template: |
  {{#each result}}
  - {{basename}}
  {{/each}}
postRenderFormat: html
replaceTargetPath: examples-tutorials/generated-top-ten-notes.md
replaceType: always
```

Here is the generated file examples-tutorials/generated-top-ten-notes.md embedded in this page.

![generated-top-ten-notes](generated-top-ten-notes.md)

