Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..")
$outDir = Join-Path $repoRoot "dist"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipPath = Join-Path $outDir "CES_SMART_PORTABLE_$stamp.zip"
$tempDir = Join-Path $env:TEMP "ces_smart_bundle_$stamp"

if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying project files..." -ForegroundColor Cyan
robocopy $repoRoot $tempDir /E /XD ".git" "node_modules" ".next" "dist" /XF "*.log" > $null

Write-Host "Creating zip: $zipPath" -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath -Force

Remove-Item -Recurse -Force $tempDir

Write-Host "Done: $zipPath" -ForegroundColor Green
