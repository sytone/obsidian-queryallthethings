import {markdown2html} from 'PostRender/MicromarkPostRenderer';
import Handlebars, {type HelperOptions} from 'handlebars';
/*
// >> id='docs-handlebars-helper-micromark' options='file=templates/hb-helpers/micromark.md'
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

// << docs-handlebars-helper-micromark
*/
/*
// >> id='docs-examples-handlebars-micromark' options='file=examples-tutorials/handlebars/micromark.md'
title: micromark Helper
---

This uses a simple query to help show what the `micromark`-helper does when rendering.

### Example

````markdown
```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#micromark inline="true"}}}{{{code}}}{{{/micromark}}}
  {{/each}}
```
````

### Live in Vault

```qatt
query: |
  SELECT 'This is a **thing** to do' AS code
template: |
  {{#each result}}
    {{{#micromark inline="true"}}}{{{code}}}{{{/micromark}}}
  {{/each}}
```

// << docs-examples-handlebars-micromark
*/
export function micromark(this: any, options: HelperOptions) {
  const inline = options.hash?.inline === 'true';
  const parsedChildTemplate = markdown2html(options.fn(this), inline);
  return new Handlebars.SafeString(parsedChildTemplate);
}
