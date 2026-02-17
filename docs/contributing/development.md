---
order: 3

parent: Contributing
title: Development
---

## Tools

Development is done using VS Code, you are welcome to use any other editor just make sure the linting and format match.

VS Code will work on all operating systems and the configuration will recommend all the extensions to try and make you life simpler when developing the plugin.

## Setting up development environment

PNPM is used as the package manager, use `npm install -g pnpm@latest-9` to install. Version 20.15.1 of NodeJS is being used for the build process so ensure that is also installed. If you use Node version manager you can run `nvm install 20.15.1` and `nvm use 20.15.1` to install and use the current node version.

Run `pnpm install` to ensure dependencies are installed and then `pnpm run build`

I run everything in PowerShell Core. The following set the shell to use it and not cmd/bash

`npm config set script-shell "$env:USERPROFILE\scoop\apps\pwsh\current\pwsh.exe"`


## Git configuration and LF/CRLF

If you are using Obsidian it converts all files to LF by default, which means git will say there are modifications on windows where there are no changes, just the LF/CRLF difference. To work in LF only in windows do the following:

```powershell
git config core.autocrlf false
git config core.eol lf
```

You may need to reset your local enlistment after this change, you can do so with these commands

```powershell
git rm -rf --cached .
git reset --hard HEAD
```

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
## Releasing

### Automatic Patch Releases (Recommended)

When a pull request is merged to the `main` branch, a GitHub Actions workflow automatically:
1. Runs `pnpm run release:patch` to bump the patch version
2. Updates `package.json`, `manifest.json`, `versions.json`, and `CHANGELOG.md`
3. Creates a git commit and tag with the new version
4. Pushes the changes and tag to the repository
5. Triggers the release workflow to create a **draft** GitHub release

This draft release can be tested in Obsidian before being published to users.

**Note:** If branch protection is enabled on the `main` branch, ensure the workflow has permission to push or configure branch protection to allow GitHub Actions to push.

### Manual Releases

For minor or major releases, you can still create releases manually:

1. Run `pnpm run release:minor:dry` (or `release:major:dry`) to preview the changes
2. If satisfied, run `pnpm run release:minor` (or `release:major`)
3. Push with `git push --follow-tags origin main`

This will trigger the release workflow to create a draft release on GitHub, which you can then review and publish.

