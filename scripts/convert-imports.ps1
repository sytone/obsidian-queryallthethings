# PowerShell script to convert imports for Deno compatibility
# This adds .ts extensions to local imports and JSON assertions

Write-Host "Starting import conversion for Deno compatibility..." -ForegroundColor Cyan
Write-Host ""

# NPM packages that should NOT get .ts extension
$npmPackages = @(
    'obsidian',
    'alasql',
    'eventemitter2',
    'handlebars',
    'luxon',
    'mdast-util-from-markdown',
    'mdast-util-to-string',
    'mdast-util-wiki-link',
    'micromark',
    '@ophidian/core',
    '@codemirror',
    '@preact'
)

function Should-Convert-Import($importPath) {
    # Don't convert if it already has an extension
    if ($importPath -match '\.(ts|js)$') { return $false }
    
    # Don't convert relative imports (they're already correct if they have extensions)
    if ($importPath -match '^\./|^\.\./') { return $false }
    
    # Don't convert npm packages
    foreach ($pkg in $npmPackages) {
        if ($importPath -eq $pkg -or $importPath.StartsWith("$pkg/")) {
            return $false
        }
    }
    
    return $true
}

$filesProcessed = 0
$importsUpdated = 0

# Find all TypeScript files
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | Where-Object { $_.FullName -notmatch 'node_modules' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Pattern 1: Convert local imports - add .ts extension
    # Matches: from 'Something' or from "Something" where Something is a local module
    $content = [regex]::Replace($content, "from\s+(['""])([^'""]+)\1", {
        param($match)
        $quote = $match.Groups[1].Value
        $importPath = $match.Groups[2].Value
        
        if (Should-Convert-Import $importPath) {
            $script:fileChanged = $true
            $script:importsUpdated++
            
            # If it's a JSON file, keep the .json but add type assertion
            if ($importPath -match '\.json$') {
                return "from $quote$importPath$quote with { type: 'json' }"
            }
            
            # Add .ts extension to local imports
            return "from $quote$importPath.ts$quote"
        }
        
        return $match.Value
    })
    
    # Pattern 2: Fix existing JSON imports that need type assertion
    $content = [regex]::Replace($content, "from\s+(['""])([^'""]+\.json)\1(?!\s+with)", {
        param($match)
        $quote = $match.Groups[1].Value
        $importPath = $match.Groups[2].Value
        $script:fileChanged = $true
        return "from $quote$importPath$quote with { type: 'json' }"
    })
    
    if ($fileChanged -or $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✓ Updated: $($file.FullName)" -ForegroundColor Green
        $filesProcessed++
    }
}

Write-Host ""
Write-Host "✨ Conversion complete!" -ForegroundColor Green
Write-Host "   Files processed: $filesProcessed" -ForegroundColor Yellow
Write-Host "   Imports updated: $importsUpdated" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review the changes: git diff" -ForegroundColor White
Write-Host "   2. Install Deno extension in VSCode and reload" -ForegroundColor White
Write-Host "   3. Check for errors: deno check src/main.ts" -ForegroundColor White
Write-Host "   4. Try building: deno task build" -ForegroundColor White
