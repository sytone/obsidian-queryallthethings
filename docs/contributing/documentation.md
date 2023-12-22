---
nav_order: 3
layout: default
parent: Contributing
title: Documentation
---

This site uses Jekyll with some pre-processing, if you are making example markdown blocks with templates you need to make sure it is set to raw in the page, use this example as a basis for any other examples you are planning to make.

`````markdown
{% raw %}
````markdown
```qatt
query: |
  SELECT TOP 1 *
  FROM obsidian_markdown_files
  ORDER BY stat->ctime DESC
template: |
      {{#each result}}
        [[{{path}}\|{{basename}}]]
      {{/each}}
```
````
{% endraw %}
`````

You will also see lines looking like this `%%snippet id='alasql-function-stringify-snippet' options='nocodeblock'%%` in the code. The pre-processor for the documentation pulls contents from the code to place in the documentation. This means that when code changes re made the documentation can be updated at the same time.

If you edit the content between these pages in the docs folder the content will be lost, make sure you update the content int he source files where the snippets are located.

To run the pre-processor for documentation execute `pnpm run build:docs` and it will pull out the snippets and replace them in the docs files.

## Site Structure

|   index.md (1)
|   first-query.md (2)
|   codeblock.md (4)
|   installation.md (3)
|   how-the-plugin-generates-output.md (5)
|   settings.md (6)
+---data-tables
|       index.md (7)
|       qatt-ReferenceCalendar.md (1)
|       obsidian-markdown-notes.md (2)
|       obsidian-markdown-files.md (3)
|       obsidian-markdown-lists.md (4)
|       obsidian-markdown-tasks.md (5)
|       dataview-pages.md (24)
|       dataview-tasks.md (25)
|       dataview-lists.md (26)
|
|   404.html
|   about.md
|
+---contributing
|       development.md
|       documentation.md
|       index.md
|

|
+---Examples
|   |   active-tasks-grouped-by-day-live.md
|   |   active-tasks-grouped-by-day.md
|   |   dataview-fields.md
|   |   index.md
|   |   listing-recently-updated-files-live.md
|   |   listing-recently-updated-files.md
|   |   using-pageproperty-simple-live.md
|   |   using-updatepropertyfromlist.md
|   |
|   +---handlebars
|   |       capitalize.md
|   |       group.md
|   |
|   \---ttrpg
|           creatures_b1.json
|           index.md
|           monster-search-live.md
|           monster-search.md
|
+---hb-helpers
|       group.md
|       index.md
|       lowercase.md
|       obsidianhtmlinternallink.md
|       stringify.md
|       uppercase.md
|       _header.md
|
+---live-examples
|   |   index.md
|   |   project-list.md
|   |
|   \---notes
|       |   index.md
|       |
|       \---projects
|               Project One.md
|               Project Two.md
|
+---queries
|       alasql.md
|       index.md
|
+---sample-notes
+---sql-functions
|       arrayfrom.md
|       custom-functions.md
|       index.md
|       parsewikilinkdisplayname.md
|       parsewikilinklocation.md
|       stringify.md
|       updatepropertyfromlist.md
|       wikilinkhasdisplayname.md
|       _header.md
|
+---sql-statements
|       case.md
|       charindex.md
|       coalesce.md
|       if-then-else.md
|       in.md
|       index.md
|       pageproperty.md
|       reverse.md
|       union.md
|       _header.md
|
+---templates
|       handlebars-helpers.md.removed
|       handlebars.md
|       index.md
|       template.md
|       _header.md
|


|-- index.md (1)
|-- first-query.md (2)
|-- installation.md (3)
|-- codeblock.md (4)
|-- data-tables
|   |-- index.md (5)
|   |--
|-- how-the-plugin-generates-output (6)
|-- settings.md (7)
|-- about.md

+-- ..
|-- (Jekyll files)
|
|-- docs
|   |-- ui-components
|   |   |-- index.md  (parent page)
|   |   |-- buttons.md
|   |   |-- code.md
|   |   |-- labels.md
|   |   |-- tables.md
|   |   +-- typography.md
|   |
|   |-- utilities
|   |   |-- index.md      (parent page)
|   |   |-- color.md
|   |   |-- layout.md
|   |   |-- responsive-modifiers.md
|   |   +-- typography.md
|   |
|   |-- (other md files, pages with no children)
|   +-- ..
|
|-- (Jekyll files)
+-- ..

## Building documentation in a Docker container

If you can run docker, this is the easiest way.

### Prerequisites for using Docker

1. Install Docker
2. Ensure Docker is running

### Seeing the docs via Docker

Now every time you want to see the docs locally, run:

```bash
./scripts/Start-DocsDocker.ps1
```

You will eventually see output ending something like this:

```text
web_1  | Configuration file: /code/docs/_config.yml
web_1  |             Source: /code/docs
web_1  |        Destination: /code/docs/_site
web_1  |  Incremental build: disabled. Enable with --incremental
web_1  |       Generating...
web_1  |       Remote Theme: Using theme pmarsceill/just-the-docs
web_1  |        Jekyll Feed: Generating feed for posts
web_1  |                     done in 4.838 seconds.
web_1  | /usr/local/bundle/gems/pathutil-0.16.2/lib/pathutil.rb:502: warning: Using the last argument as keyword parameters is deprecated
web_1  |  Auto-regeneration: enabled for '/code/docs'
web_1  |     Server address: http://0.0.0.0:4000/obsidian-queryallthethings/
web_1  |   Server running... press ctrl-c to stop.
```

This runs a web server inside Docker that you can view on your own machine.
Look for the line containing `Server address:` and open that URL in your local browser.
It will be something like <http://127.0.0.1:4000/obsidian-queryallthethings/>.

You can stop the service by hitting `Ctrl+c`.

## Building documentation Locally

The project uses jekyll, before you can use Jekyll to test your changes it needs to be installed.

- Install [Jekyll](https://jekyllrb.com/docs/installation/).

If you use scoop on windows you can run the following, this may change over time so use the link above as default reference.

```pwsh
scoop install ruby
scoop install msys2
msys2
# Then exit from msys2
ridk install
# Press enter for defaults
gem install jekyll bundler
jekyll -v
```

## Building your site locally

1. Open Terminal
2. Navigate to `./docs`
3. Run `bundle install`.
4. Run your Jekyll site locally.

    ```shell
    $ bundle exec jekyll serve
    > Configuration file: S:/repos/gh/obsidian-queryallthethings/docs/_config.yml
    > To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
    >             Source: S:/repos/gh/obsidian-queryallthethings/docs
    >        Destination: S:/repos/gh/obsidian-queryallthethings/docs/_site
    >  Incremental build: disabled. Enable with --incremental
    >       Generating...
    >        Jekyll Feed: Generating feed for posts
    >                     done in 0.488 seconds.
    >  Auto-regeneration: enabled for 'S:/repos/gh/obsidian-queryallthethings/docs'
    >     Server address: http://127.0.0.1:4000/
    >   Server running... press ctrl-c to stop.
    ```

    **Note:** If you've installed Ruby 3.0 or later (which you may have if you installed the default version via Homebrew), you might get an error at this step. That's because these versions of Ruby no longer come with `webrick` installed.

    To fix the error, try running `bundle add webrick`, then re-running `bundle exec jekyll serve`.
5. To preview your site, in your web browser, navigate to `http://localhost:4000`.
