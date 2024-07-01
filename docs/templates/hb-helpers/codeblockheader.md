---

parent: Handlebars Helpers
grand_parent: Using Templates
title: codeBlockHeader
---
# {{ $frontmatter.title }}

The `codeBlockHeader`\-helper will insert the three back ticks into the resulting markdown with the name specified as a parameter as the code block type.

```handlebars
  {{codeBlockHeade 'text'}}
```

will result in:

````markdown
```text
````