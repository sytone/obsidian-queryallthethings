---
layout: default
parent: Handlebars Helpers
grand_parent: Templates
title: obsidian html internal link
---
The `obsidianHtmlInternalLink` helper takes a path and a label and returns a link
matches the default HTML that obsidian uses for internal links. If ths files ends
in `.md` then the extension is removed from the link.

{% raw %}

```handlebars
  {{{obsidianHtmlInternalLink internalPath basename}}}
```

{% endraw %}

when used with this context:

```
{
  path: "notepages/school/My Cool Page",
  name: "My Cool Page is here!"
}
```

will result in:

```
<a data-tooltip-position="top" aria-label="notepages/school/My Cool Page" data-href="notepages/school/My Cool Page" href="notepages/school/My Cool Page" class="internal-link" target="_blank" rel="noopener">My Cool Page is here!</a>
```