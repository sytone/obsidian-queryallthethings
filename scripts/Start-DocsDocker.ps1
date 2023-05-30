[CmdletBinding()]
param (
  [Parameter()]
  [string]
  $Tag = 'obsidian-queryallthethings-docs:latest',
  [switch]
  $ResetImage
)

function message($message) {
  Write-Host "`n#`n#`n# $message`n#`n#`n"
}

# move to the docs root to do the docker creation.
Push-Location "$PSScriptRoot/../docs"

if ($ResetImage) {
  message 'Removing old image'
  docker rmi $Tag
}

# Check if a built image exists.
# If not, we need to build it first.
if ($null -eq (docker images -q $Tag) ) {
  message 'First time starting the server.'
  message "Using: $Tag"
  message 'We need to build the image first...'
  docker build --tag $Tag .
}

message 'Stop the server with Ctrl-c'

# Actually run the jekyll server.
# Volume with :Z is required for linux users due to SELinux.
docker run --rm `
  -it `
  -e 'JEKYLL_ENV=docker' `
  --volume "${PWD}:/docs:Z" `
  --publish 4000:4000 `
  "$Tag"

Pop-Location
