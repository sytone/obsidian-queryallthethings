---
nav_order: 3
layout: default
parent: Contributing
title: Development
---

## Tools

Development is done using VS Code, you are welcome to use any other editor just make sure the linting and format match.

VS Code will work on all operating systems and the configuration will recommend all the extensions to try and make you life simpler when developing the plugin.

## Setting up development environment

PNPM is used as the package manager, use `npm install -g pnpm` to install. Version 16 of NodeJS is being used for the build process so ensure that is also installed. If you use Node version manager you can run `nvm install 16.20.2` and `nvm use 16.20.2` to install and use the current node version.

Run `pnpm install` to ensure dependencies are installed and then `pnpm run build`

## Dev Container

To make the process of developing simpler this repo has a dev container configuration. This means you can use a virtual container to work on changes and connect to that from any location in the browser or VSCode.

## Testing changes

You can set the `OBSIDIAN_TEST_VAULT` environment variable to the vault you want to test with or use a symlink.

Environment Variable Example:

```powershell
$env:OBSIDIAN_TEST_VAULT = "C:\obsidian\brainstore"
```

Symlink Example:

```powershell
New-Item -ItemType Junction -Target ".\dist" -Path "C:\obsidian\brainstore\.obsidian\plugins\qatt\"
```

