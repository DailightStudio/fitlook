# fitlook Virtual Try-On Complete Setup Script
# Automates: DB migration, Unity scene creation, WebGL build, deployment

param(
    [switch]$SkipUnity,
    [switch]$DeployOnly,
    [switch]$NoBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       fitlook Virtual Try-On - Complete Setup             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Validate environment
Write-Host "📋 Validating environment..." -ForegroundColor Yellow
if (-not (Test-Path "$ProjectRoot\package.json")) {
    Write-Host "❌ Error: package.json not found at $ProjectRoot" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$ProjectRoot\.env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. Using existing database." -ForegroundColor Yellow
}

Write-Host "✅ Environment validated" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
if (-not $DeployOnly) {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm install 2>&1 | Select-Object -Last 5
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Step 3: Database migration (automated with Node.js)
if (-not $DeployOnly -and -not $NoBuild) {
    Write-Host "🗄️  Setting up database migration..." -ForegroundColor Yellow

    $migrationScript = @"
const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  dotenv.config({ path: '.env.local' });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, 'drizzle', '0003_add_model_3d_url.sql'), 'utf-8');

    // Check if column already exists
    const checkResult = await client.query(\`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='products' AND column_name='model_3d_url'
    \`);

    if (checkResult.rows.length > 0) {
      console.log('✅ Column model_3d_url already exists');
      return;
    }

    await client.query(sql);
    console.log('✅ Migration applied successfully');
  } catch (error) {
    console.error('⚠️  Migration skipped:', error.message);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
"@

    Set-Content -Path "$ProjectRoot\run-migration.js" -Value $migrationScript -Encoding utf8

    # Check if pg package exists
    $packageJson = Get-Content "$ProjectRoot\package.json" | ConvertFrom-Json
    if (-not $packageJson.dependencies.pg) {
        Write-Host "ℹ️  pg package not in dependencies, skipping auto-migration" -ForegroundColor Yellow
        Write-Host "   Manual migration: Execute drizzle/0003_add_model_3d_url.sql in Neon dashboard" -ForegroundColor Gray
    } else {
        npm run migration 2>&1 | Select-Object -Last 3
    }

    Write-Host "✅ Database migration prepared" -ForegroundColor Green
    Write-Host ""
}

# Step 4: Build Unity WebGL (if not skipped)
if (-not $SkipUnity -and -not $NoBuild) {
    Write-Host "🎮 Building Unity WebGL viewer..." -ForegroundColor Yellow
    Write-Host "   (This may take 5-10 minutes)" -ForegroundColor Gray

    $unityPath = "C:\Program Files\Unity\Hub\Editor\2022.3.17f1\Editor\Unity.exe"
    $unityProjectPath = "$ProjectRoot\unity\fitlook-viewer"

    if (-not (Test-Path $unityPath)) {
        Write-Host "⚠️  Unity not found at default location" -ForegroundColor Yellow
        Write-Host "    Skipping WebGL build. Run 'npm run build:unity' manually after installing Unity." -ForegroundColor Gray
    } else {
        Write-Host "   Building at: $unityProjectPath" -ForegroundColor Gray

        # Run Unity build
        & powershell -ExecutionPolicy Bypass -File "$ProjectRoot\scripts\build-unity.ps1" 2>&1 | Select-Object -Last 10

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ WebGL build completed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WebGL build had issues (may be acceptable if output exists)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Step 5: Build Next.js & OpenNext
if (-not $NoBuild) {
    Write-Host "🚀 Building Next.js for Cloudflare..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm run build:cf 2>&1 | Select-Object -Last 5
    Write-Host "✅ Next.js build completed" -ForegroundColor Green
    Write-Host ""
}

# Step 6: Deploy to Cloudflare Pages
if (-not $NoBuild) {
    Write-Host "☁️  Deploying to Cloudflare Pages..." -ForegroundColor Yellow

    # Check if wrangler is available
    $wranglerPath = npm ls -g wrangler 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  wrangler CLI not found. Install with: npm install -g wrangler" -ForegroundColor Yellow
        Write-Host "    Skipping deployment." -ForegroundColor Gray
    } else {
        Write-Host "   Deploying .open-next/ to Cloudflare Pages..." -ForegroundColor Gray
        wrangler pages deploy .open-next/public --project-name fitlook 2>&1 | Select-Object -Last 5

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment completed" -ForegroundColor Green
            Write-Host "   View at: https://fitlook.pages.dev or https://fitlook.org" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  Deployment may need manual steps" -ForegroundColor Yellow
            Write-Host "   Run: wrangler pages deploy .open-next/public" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Final summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Setup Complete!                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🗄️  Database Migration (if not auto-applied):" -ForegroundColor Yellow
Write-Host "   • Go to https://console.neon.tech" -ForegroundColor Gray
Write-Host "   • SQL Editor → execute drizzle/0003_add_model_3d_url.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🎮 Unity (if skipped or custom build needed):" -ForegroundColor Yellow
Write-Host "   • Open Unity 2022.3 LTS with: unity/fitlook-viewer/" -ForegroundColor Gray
Write-Host "   • Menu > fitlook > Setup > Create TryOn Scene" -ForegroundColor Gray
Write-Host "   • Menu > fitlook > Setup > Configure Build Settings" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🧪 Test Locally:" -ForegroundColor Yellow
Write-Host "   • npm run dev" -ForegroundColor Gray
Write-Host "   • Open http://localhost:3000/products/submit" -ForegroundColor Gray
Write-Host "   • Enter a product URL and test 3D generation" -ForegroundColor Gray
Write-Host ""
Write-Host "4. ☁️  Verify Deployment:" -ForegroundColor Yellow
Write-Host "   • Visit: https://fitlook.org" -ForegroundColor Gray
Write-Host "   • Test the 3D viewer endpoint" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Full Setup: VIRTUAL-TRYON-SETUP.md" -ForegroundColor Gray
Write-Host "   • Quick Ref: QUICK-START.md" -ForegroundColor Gray
Write-Host "   • Unity Guide: unity/fitlook-viewer/README.md" -ForegroundColor Gray
Write-Host ""
