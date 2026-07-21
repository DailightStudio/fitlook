# Unity Project Setup Script for fitlook-viewer

param(
    [string]$UnityPath = "C:\Program Files\Unity\Hub\Editor\2022.3.17f1\Editor\Unity.exe"
)

Write-Host "Setting up fitlook Unity WebGL project..." -ForegroundColor Green

# Check if Unity is installed
if (-not (Test-Path $UnityPath)) {
    Write-Host "ERROR: Unity not found at $UnityPath" -ForegroundColor Red
    Write-Host "Please install Unity 2022.3 LTS or update the path"
    exit 1
}

$projectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Write-Host "Project directory: $projectDir"

# Initialize Git LFS if needed
if (Test-Path "$projectDir\.git") {
    Write-Host "Git repository detected, checking LFS..." -ForegroundColor Yellow
    & git lfs install
}

# Create necessary directories
@(
    "Assets\Scenes",
    "Assets\Models",
    "Assets\Materials",
    "Assets\Plugins",
    "Assets\Editor",
    "ProjectSettings"
) | ForEach-Object {
    $path = "$projectDir\unity\fitlook-viewer\$_"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $_"
    }
}

Write-Host ""
Write-Host "Project structure is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open Unity Hub and add this project: $projectDir\unity\fitlook-viewer"
Write-Host "2. Create a scene at Assets/Scenes/TryOn.unity with the following GameObjects:"
Write-Host "   - Avatar: with Animator component and AvatarController script"
Write-Host "   - Main Camera: with CameraController script attached"
Write-Host "   - TryOnManager: with TryOnManager script (coordinator)"
Write-Host "3. In Package Manager, add com.unity.cloud.gltfast 6.0.0"
Write-Host "4. Import glTFast package for runtime model loading"
Write-Host "5. Run: npm run build:unity (to build WebGL)"
Write-Host ""
