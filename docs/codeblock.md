---
order: 4

title: Codeblock Configuration
---

When you create the query and template to render the results if the query the configuration values are placed in a markdown codeblock with the tag `qatt` added after the first three backticks of the block.

The configuration is YAML based and support the following properties. As it is YAML you can use the `|` symbol after the key name and enter your values on multiple lines which are indented.

Here is an example of all codeblock configurations

```yaml
customJSForSql: ['MyCoolClass ConvertWordsToEmoji','MyCoolClass AnotherSQLFunction']
customJSForHandlebars: ['MyCoolClass MyHandlebarsHelper']
query: |
  SELECT TOP 10
    basename
  FROM obsidian_notes
queryFile: qatt/queries/GetTop10Notes.md
queryEngine: alasql
template: |
  {{#each result}}
  {{basename}}
  {{/each}}
templateFile: qatt/templates/ListOfNotes.md
postRenderFormat: markdown | micromark | html | raw
renderEngine: handlebars | text
logLevel: trace | debug | info | warn | error
replaceCodeBlock: true | false
replaceTargetPath: notes/topten.md
replaceType: never | once | onceDaily | onceDailyAppend | onceDailyPrepend | onceWeekly | always | alwaysappend | alwaysprepend
```

%%snippet id='docs-codeblock-configuration-customjsforsql' options='nocodeblock'%%
## customJSForSql

If you have the CustomJS plugin installed this field allows you to reference any CustomJS classes and methods and they will be loaded in the AlaSQL engine so you can call them in a query to extend the capabilities of the query for personal needs.

It expects an array of string with a space between the class name and the method name

So for example if you have a class called MyCoolClass with a method in it called ConvertWordsToEmoji you would set the value like this:

```
customJSForSql: ['MyCoolClass ConvertWordsToEmoji']
```

Then in the query field you can reference this function just like the other inbuilt functions already available.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-customjsforhandlebars' options='nocodeblock'%%
## customJSForHandlebars

This works the same as `customJSForSql` but makes the functions available as helper blocks in handlebars so you can customize you rendering further.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-query' options='nocodeblock'%%
## query

This is the query to pass to the chosen query engine, currently only the AlaSQL engine is available.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-queryfile' options='nocodeblock'%%
## queryFile

To simplify query reuse you can specify a query file, this is the absolute path to a md file in your vault. The file should have nothing but the query contents in it.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-queryengine' options='nocodeblock'%%
## queryEngine

This defines the query engine to use to execute the query entered for the query field.

By default it will use alasql so you do not have to set this. The only supported value is `alasql` currently.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-template' options='nocodeblock'%%
## template

This value is used to render the results of the query.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-templatefile' options='nocodeblock'%%
## templateFile

To simplify template reuse you can template a query file, this is the absolute path to a md file in your vault. The file should have nothing but the template contents in it.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-postrenderformat' options='nocodeblock'%%
## postRenderFormat

Once the render engine is completed the output will be written to the page in Obsidian. As Obsidian uses HTML to display information to the user the rendered output will be treated as HTML. If you use a template that output markdown it would not be rendered correctly.

To make this simpler there are three options. The default is `micromark` which uses the micromark engine to convert markdown to HTML. It has all the GitHub extensions enabled  by default so should handle most markdown as you would expect Obsidian to handle it.

You can also choose `markdown` which uses the internal Obsidian markdown engine, this may cause some display issues as it need to render the markdown in an asynchronous way so a page refresh may be needed if you are rendering more complex markdown blocks.

The last value is `html`, this assumes the rendered results are already in a html format  ready to be displayed in Obsidian. This is used for more complex rendering of things like tasks so you can check them off from the query results and have the original not they are on updated.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-renderengine' options='nocodeblock'%%
## renderEngine

By default it will use handlebars so you do not have to set this. It supports two options currently, `handlebars` which will use the handlebars library to render the results and `text` which will render the results as a JSON string. More can be added as needed and pul requests for new rendering formats are welcome.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-loglevel' options='nocodeblock'%%
## logLevel

This sets the level of logging used when this code block is processed. Setting it to `debug` or `trace` will give you the raw data and rendered results in a raw format in the console. This is handy for debugging issues with the results or rendering.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacecodeblock' options='nocodeblock'%%
## replaceCodeBlock

**Pending Feature**

If set to true the page that the codeblock on it will be updated with the rendered content, this process updates the file so outside of obsidian you can access the contents.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacetargetpath' options='nocodeblock'%%
## replaceTargetPath

**Pending Feature**

The path to the file to replace the contents of with the rendered output. This is an absolute path to a file in your vault.

If this is defined the `replaceCodeBlock` option is ignored and the page with the codeblock will not be updated.
%%/snippet%%

%%snippet id='docs-codeblock-configuration-replacetype' options='nocodeblock'%%
## replaceType

**Pending Feature**

Valid replacement types for the codeblock or target file.
['never', 'once', 'onceDaily', 'onceDailyAppend', 'onceDailyPrepend', 'onceWeekly', 'always', 'alwaysAppend', 'alwaysPrepend']

As the results of the query and render are only shown in Obsidian if you look at the markdown file in a text editor you will only see the query and template details. For most situations this would be fine but if you want the results and rendered output to be more permanent you can use this option to write the output to the page directly.

By default the value will be `never` so each time the page is shown in Obsidian it is dynamically rendered.

If you set it to `once` the entire codeblock or target path will be processed and replaced with the output, this will remove / disable the codeblock from the file completely and the rendered results will not change from that point forward.

If you set it to `always` the rendered output will be placed before the codeblock and in preview and reading view the codeblock will be rendered as a blank string to hide it. It is still there and you can edit it in edit mode. When viewing in a text editor you will see the rendered output and then the codeblock below it. To place the renderers content after the codeblock use `alwaysappend`. You can also use `alwaysprepend` if you want to be explicit.
%%/snippet%%