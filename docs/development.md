
# Development

## Tools

Development is done using VS Code, you are welcome to use any other editor just make sure the linting and format match.

## Dev Container

To make the process of developing simpler this repo has a dev container configuration. This means you can use a virtual container to work on changes and connect to that from any location in the browser or VSCode.

## Using a symlink to help test changes

New-Item -ItemType Junction -Target ".\dist" -Path "C:\obsidian\brainstore\.obsidian\plugins\qatt\"

## Building documentation

The project uses jekyll, before you can use Jekyll to test your changes it needs to be installed.

- Install [Jekyll](https://jekyllrb.com/docs/installation/).

If you use scoop on windos you can run the following, this may change over time so use the link above as default reference.

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

1.  Open Terminal
    
2.  Navigate to `./docs`
    
3.  Run `bundle install`.
    
4.  Run your Jekyll site locally.
    
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
    
5.  To preview your site, in your web browser, navigate to `http://localhost:4000`.

