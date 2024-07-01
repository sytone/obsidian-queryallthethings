---
order: 16

title: Using Templates
has_children: true
---
# {{ $frontmatter.title }}

The main engine used to render the results of a query uses the handlebars syntax. This allows you to create a flexible template to render the results.

Full details on Handlebars can be found on their site. [Handlebars Guide](https://handlebarsjs.com/guide/)

The handlebars syntax is about rendering and has limited logic, the query is expected to handle the complexity of the data manipulation leaving the output to handlebars.
