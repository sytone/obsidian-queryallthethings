---

parent: Handlebars Helpers
grand_parent: Using Templates
title: codeBlockFooter
---

# {{ $frontmatter.title }}

The `codeBlockFooter`\-helper will insert the three back ticks into the resulting markdown.

```handlebars
  {{codeBlockFooter}}
```

will result in:

````markdown
```
````