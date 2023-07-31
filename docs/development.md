---
nav_order: 3
layout: default
title: Development
---

# Development

## Tools

Development is done using VS Code, you are welcome to use any other editor just make sure the linting and format match.

VS Code will work on all operating systems and the configuration will recommend all the extensions to try and make you life simpler when developing the plugin.

## Setting up development environment

PNPM is used as the package manager, use `npm install -g pnpm` to install. Version 16 of NodeJS is being used for the build process so ensure that is also installed.

Run `pnpm install` to ensure dependencies are installed and then `pnpm run build`

## Dev Container

To make the process of developing simpler this repo has a dev container configuration. This means you can use a virtual container to work on changes and connect to that from any location in the browser or VSCode.

## Testing changes

You can set the `OBSIDIAN_TEST_VAULT` enviroment variable to the vault you want to test with or use a symlink.

Environment Variable Example:

```powershell
$env:OBSIDIAN_TEST_VAULT = "C:\obsidian\brainstore"
```

Symlink Example:

```powershell
New-Item -ItemType Junction -Target ".\dist" -Path "C:\obsidian\brainstore\.obsidian\plugins\qatt\"
```

## Documentation

This site uses Jekyll, if you are making example markdown blocks with templates you need to make sure it is set to raw in the page, use this example as a basis for any other examples you are planning to make.

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

### Building documentation in a Docker container

If you can run docker, this is the easiest way.

#### Prerequisites for using Docker

1. Install Docker
2. Ensure Docker is running

#### Seeing the docs via Docker

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

### Building documentation Locally

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

### Building your site locally

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
