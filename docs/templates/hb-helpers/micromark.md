---

parent: Handlebars Helpers
grand_parent: Using Templates
title: micromark
---
# {{ $frontmatter.title }}

The `micromark`-helper renders markdown as HTML using the micromark library. It has one setting which will remove the wrapping `<p>` tag from the output if inline is set to true.

```handlebars
      {{{#micromark inline="true"}}} {{{task}}} [[{{{page}}}|📝]] {{{/micromark}}}
```

when used with this context:

```json
    {
      task: "This is a **thing** to do",
      page: "folder/SomePage.md"
    }
```

will result in:

````markdown
    This is a <strong>thing</strong> to do
````

If the inline property is not set, then the output will be wrapped in a `<p>` tag and result in:

```
<p>This is a <strong>thing</strong> to do</p>
```