import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-obsidianhtmlinternallink' options='file=templates/hb-helpers/obsidianhtmlinternallink.md'
title: obsidianHtmlInternalLink
---

The `obsidianHtmlInternalLink` helper takes a path and a label and returns a link
matches the default HTML that obsidian uses for internal links. If ths files ends
in `.md` then the extension is removed from the link.

```handlebars
  {{{obsidianHtmlInternalLink internalPath basename}}}
```

when used with this context:

```json
{
  path: "notepages/school/My Cool Page",
  name: "My Cool Page is here!"
}
```

will result in:

```html
<a data-tooltip-position="top" aria-label="notepages/school/My Cool Page" data-href="notepages/school/My Cool Page" href="notepages/school/My Cool Page" class="internal-link" target="_blank" rel="noopener">My Cool Page is here!</a>
```

// << docs-handlebars-helper-obsidianhtmlinternallink
*/
/*
// >> id='docs-examples-handlebars-obsidianhtmlinternallink' options='file=examples-tutorials/handlebars/obsidianhtmlinternallink.md'
title: obsidianHtmlInternalLink Helper
---
# {{ $frontmatter.title }}

This uses a simple query to help show what the obsidianHtmlInternalLink helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT TOP 1 path, basename FROM obsidian_notes
template: |
  {{#each result}}
    {{obsidianHtmlInternalLink path basename}}
  {{/each}}
```

// << docs-examples-handlebars-obsidianhtmlinternallink
*/
export function obsidianHtmlInternalLink(link: string, label: string) {
  return new Handlebars.SafeString(`<a data-tooltip-position="top" aria-label="${link}" data-href="${link}" href="${link}" class="internal-link" target="_blank" rel="noopener">${label}</a>`);
}
