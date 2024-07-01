---
order: 6

title: Output Generation
---
# {{ $frontmatter.title }}

This page is to help you understand the process the plugin uses to generate the rendered output using the configuration in the code block.

1. When a render request is made for a page in Obsidian the plugin is registered to handle any code blocks with the `qatt` tag applied to it.
2. The configuration is taken and parsed assuming it is valid YAML syntax. From this the configuration is taken for the query, rendering and other settings used for that code block.
3. From the configuration the [logLevel](codeblock.md#logLevel) is parsed and used for all the logging of just that codeblock.
4. The plugin then registers for events related to pages being modified in the vault. If that happens it will run the query and render again.
5. The query is then run using the [query](codeblock.md#query) value against the specified [queryEngine](codeblock.md#queryEngine). By default this is AlaSQL.
6. If there are errors in the query, the messages are rendered for the user to fix.
7. The results from the query are then taken by the render engine specified in the default configuration or specified in the codeblock using the [renderEngine](codeblock.md#renderEngine) property.
8. The result of the render engine is then taken and the default post renderer or the post renderer specified by the [postRenderFormat](codeblock.md#postRenderFormat) takes the output and makes any changes.
9. The output from the post renderer is then placed in the inner HTML block of the code block and shown for the user.

## Key things to think about

1. All the output has to be rendered by Obsidian/Electron at the end. It is always expected to be HTML. So if you are using the rendering engine to output markdown you need to use `micromark` or `markdown` in the post processing.
2. The query engine is querying a collection of objects for the most part. This is slightly different than the normal approach using SQL where it queries tables with columns and rows. This does allow you to use JavaScript notation and dig into the object properties which can increase the power of your queries. When drilling into objects or using functions replace the `.` used in JavaScript with `->`.
3. Rendering is using [Handlebars](templates/index.md), there are the default helpers as well as some custom ones, this can increase over time.
