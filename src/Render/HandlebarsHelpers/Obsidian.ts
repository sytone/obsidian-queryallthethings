import {MarkdownPreviewView, Component} from 'obsidian';
import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-obsidian' options='file=templates/hb-helpers/obsidian.md'
title: obsidian
---
# {{ $frontmatter.title }}

The `obsidian`-helper renders markdown as HTML using the obsidian markdown engine. It has one setting which will remove the wrapping `<p>` tag from the output if inline is set to true.

```handlebars
      {{{#obsidian inline="true"}}} {{{task}}} [[{{{page}}}|📝]] {{{/obsidian}}}
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

// << docs-handlebars-helper-obsidian
*/
/*
// >> id='docs-examples-handlebars-obsidian' options='file=examples-tutorials/handlebars/obsidian.md'
title: obsidian Helper
---

This uses a simple query to help show what the `obsidian`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#obsidian inline="true"}}}{{{code}}}{{{/obsidian}}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#obsidian inline="true"}}}{{{code}}}{{{/obsidian}}}
  {{/each}}
```

// << docs-examples-handlebars-obsidian
*/
export function obsidian(this: any, options: HelperOptions) {
  const inline = options.hash?.inline === 'true';

  const element = document.createElement('span');
  MarkdownPreviewView.renderMarkdown(options.fn(this), element, '', new Component()).catch(error => {
    console.error(error);
  });

  if (inline) {
    return new Handlebars.SafeString(element.innerHTML.replace(/<p>|<\/p>/g, ''));
  }

  return new Handlebars.SafeString(element.innerHTML);
}
