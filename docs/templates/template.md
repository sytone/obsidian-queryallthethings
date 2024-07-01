---
order: 4

parent: Templates
title: Template
---
# {{ $frontmatter.title }}

The template uses Handlebars as the formatting structure. Full details on Handlebars can be found on their site and will not be replicated here.

[Handlebars Guide](https://handlebarsjs.com/guide/)

## Custom Block Helpers

The following Block level helpers are avaliable to be used in rendering your output.

### #micromark

%%snippet id='handlebars-helper-micromark-snippet' options='nocodeblock'%%
The `micromark`\-helper renders markdown as HTML using the micromark library. It has one setting
which will remove the wrapping `<p>` tag from the output if inline is set to true.


```handlebars
  {{{#micromark inline="true"}}} {{{task}}} [[{{{page}}}|📝]] {{{/micromark}}}
```


when used with this context:

```
{
  task: "This is a **thing** to do",
  page: "folder/SomePage.md"
}
```

will result in:

```
This is a <strong>thing</strong> to do
```

If the inline property is not set, then the output will be wrapped in a `<p>` tag and result in:

```
<p>This is a <strong>thing</strong> to do</p>
```
%%/snippet%%
