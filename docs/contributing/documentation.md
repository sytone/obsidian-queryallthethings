---
order: 3

parent: Contributing
title: Documentation
---

This site uses Jekyll with some pre-processing, if you are making example markdown blocks with templates you need to make sure it is set to raw in the page, use this example as a basis for any other examples you are planning to make.

`````markdown
````markdown
```qatt
query: |
  SELECT TOP 1 *
  FROM obsidian_notes
  ORDER BY created DESC
template: |
      {{#each result}}
        [[{{path}}\|{{basename}}]]
      {{/each}}
```
````
`````

You will also see lines looking like this `%%snippet id='alasql-function-stringify-snippet' options='nocodeblock'%%` in the code. The pre-processor for the documentation pulls contents from the code to place in the documentation. This means that when code changes re made the documentation can be updated at the same time.

If you edit the content between these pages in the docs folder the content will be lost, make sure you update the content int he source files where the snippets are located.

To run the pre-processor for documentation execute `pnpm run build:docs` and it will pull out the snippets and replace them in the docs files.

You can open these documents in Obsidian, use the following command to also setup the build to automatically build and publish the changes you make to the plugin `$env:OBSIDIAN_TEST_VAULT = Resolve-Path "./docs"; pnpm run build:dev`. Please take into account some of the documents are automatically generated.

## Site Structure

```text
|   index.md (1)
|   first-query.md (2)
|   codeblock.md (4)
|   installation.md (3)
|   output-generation.md (5)
|   settings.md (6)
|
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
+---queries
|   |   alasql.md
|   |   index.md
|   |
|   +---sql-functions (Any custom function documentation)
|   |       ...
|   |
|   \---sql-statements (SQL statement documentation and help)
|           ...
|
+---templates
|   |   handlebars.md
|   |   index.md
|   |
|   \---hb-helpers (Any custom Handlebars Helper documentation)
|           ...
|
+---examples-tutorials (all examples and tutorials are here. Append with live so there is a version that works in a vault if they load the docs zip.)
|   |   active-tasks-grouped-by-day-live.md
|   |   active-tasks-grouped-by-day.md
|   |   dataview-fields.md
|   |   index.md
|   |   listing-recently-updated-files-live.md
|   |   listing-recently-updated-files.md
|   |   using-pageproperty-simple-live.md
|   |   using-updatepropertyfromlist.md
|   |
|   +---handlebars (handlebars explicit live examples)
|   |       capitalize.md
|   |       group.md
|   |
|   |
|   \---ttrpg (TTRPG specific examples)
+---contributing
|       development.md
|       documentation.md
|       index.md
|
|   about.md
```

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
