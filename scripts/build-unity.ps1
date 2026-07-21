# Build Unity WebGL viewer and deploy to public directory

param(
    [string]$UnityPath = "C:\Program Files\Unity\Hub\Editor\2022.3.17f1\Editor\Unity.exe",
    [string]$ProjectPath = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)),
    [string]$OutputPath = ".open-next\public\unity-viewer"
)

Write-Host "Building Unity WebGL project..." -ForegroundColor Green

# Check if Unity exists
if (-not (Test-Path $UnityPath)) {
    Write-Host "ERROR: Unity not found at $UnityPath" -ForegroundColor Red
    exit 1
}

$unityProject = Join-Path $ProjectPath "unity\fitlook-viewer"
if (-not (Test-Path (Join-Path $unityProject "Assets"))) {
    Write-Host "ERROR: Unity project not found at $unityProject" -ForegroundColor Red
    exit 1
}

# Create output directory
$outputDir = Join-Path $ProjectPath $OutputPath
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force $outputDir | Out-Null
}

# Build WebGL
Write-Host "Building WebGL (this may take 5-10 minutes)..."
$buildDir = Join-Path $outputDir "Build"

& "$UnityPath" `
    -projectPath $unityProject `
    -buildWebGL `
    -buildPath $buildDir `
    -quit `
    -batchmode `
    -logFile "$ProjectPath\unity-build.log"

$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
    Write-Host "Build failed with exit code: $exitCode" -ForegroundColor Red
    Write-Host "Check $ProjectPath\unity-build.log for details"
    exit 1
}

Write-Host "Build succeeded!" -ForegroundColor Green
Write-Host "Output location: $outputDir"
Write-Host ""
Write-Host "The WebGL build is ready to be deployed."
