# Virtual Try-On Setup Checklist

Complete Virtual Try-On 3D system implementation for fitlook. This document tracks all components and setup steps.

## ✅ Completed Implementation

### Frontend (Next.js)

- [x] **Web Crawler** (`src/lib/crawl.ts`)
  - Extracts product images from shopping mall URLs
  - Methods: OG meta tags, Twitter Card, img elements
  - Handles various e-commerce sites

- [x] **Tripo.AI Integration** (`src/lib/tripo.ts`)
  - `submitImageToTripo()` - Submit image for 3D generation
  - `getTripoTaskStatus()` - Poll task status
  - `waitForTripoTask()` - Wait for completion
  - `generateTripoModel()` - Full pipeline (submit + wait + return GLB URL)

- [x] **API Endpoint** (`src/app/api/products/generate-from-url/route.ts`)
  - POST endpoint: URL → Image → 3D Model
  - Extracts image, generates 3D, returns modelUrl
  - Returns: {success, modelUrl, imageUrl, productName, sourceUrl}

- [x] **Product Submission Page** (`src/app/products/submit/page.tsx`)
  - User input form for shopping mall URL
  - Polling for 3D model generation (2-10 seconds)
  - ModelViewer component for preview

- [x] **Submission Form Component** (`src/components/products/SubmitProductForm.tsx`)
  - Input validation
  - Loading state + error handling
  - Display generated 3D model

- [x] **Google Model Viewer** (`src/components/products/ModelViewer.tsx`)
  - Fallback 3D viewer
  - Auto-rotate, camera controls, zoom
  - Unpkg CDN: https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js

- [x] **Unity WebGL Viewer** (`src/components/products/UnityViewer.tsx`)
  - Primary 3D viewer component
  - Loads WebGL build from `/unity-viewer/Build/`
  - Mouse controls: drag to rotate, scroll to zoom
  - Automatic fallback to Google Model Viewer on error
  - JS ↔ Unity communication via postMessage

- [x] **Header Navigation** (`src/components/layout/Header.tsx`)
  - Added "3D 생성" link to `/products/submit`
  - Highlighted with accent color for visibility

- [x] **Product Detail Page** (`src/app/products/[id]/page.tsx`)
  - Shows 3D viewer if model_3d_url exists
  - Falls back to 2D image otherwise
  - Product info, price, purchase link

### Database (Drizzle ORM)

- [x] **Schema Update** (`src/lib/schema.ts`)
  - Added `model_3d_url: text('model_3d_url')` to products table

- [x] **Migration File** (`drizzle/0003_add_model_3d_url.sql`)
  - SQL: `ALTER TABLE products ADD COLUMN model_3d_url text;`
  - ⚠️ **TODO:** Manual execution needed (see below)

### Environment Configuration

- [x] **Tripo.AI API Key** (`.env.local`)
  - `TRIPO_API_KEY=tsk_k7CaKGWvvweAoN-O-kEWs1XsO3LxzKxXUjIvf2ZNsCd`

### Unity WebGL Project

- [x] **Project Structure**
  - Location: `unity/fitlook-viewer/`
  - Standard Unity 2022.3 project layout
  - ProjectSettings with WebGL configuration

- [x] **Core Scripts**
  - `Assets/Scripts/AvatarController.cs` - Avatar animations (idle, walk, turn)
  - `Assets/Scripts/GarmentLoader.cs` - Async glTF/glb loading via glTFast
  - `Assets/Scripts/CameraController.cs` - Orbit camera (rotation + zoom)
  - `Assets/Scripts/TryOnManager.cs` - Coordinator + JS bridge handler

- [x] **WebGL Bridge** (`Assets/Plugins/UnityWebGLBridge.jslib`)
  - Bidirectional JS ↔ Unity communication
  - Methods:
    - `LoadGarment(url)` - Load 3D model
    - `SetPose(poseId)` - Change avatar pose
    - `RotateCamera(deltaX, deltaY)` - Rotate view
    - `ZoomCamera(delta)` - Zoom in/out
    - `CaptureScreenshot(filename)` - Screenshot

- [x] **Package Dependencies** (`Packages/manifest.json`)
  - `com.unity.cloud.gltfast@6.0.0` - Runtime glTF/glb loading

- [x] **Build Automation**
  - `Assets/Editor/WebGLBuilder.cs` - Build menu command
  - `Assets/Editor/SceneSetup.cs` - Scene + build settings auto-creation
  - `scripts/build-unity.ps1` - PowerShell build script
  - `npm run build:unity` - npm script wrapper

- [x] **Project Settings**
  - `ProjectSettings/ProjectVersion.txt` - Unity 2022.3.17f1
  - `ProjectSettings/PlayerSettings.asset` - WebGL config (Brotli, 256MB memory)
  - `ProjectSettings/QualitySettings.asset` - Performance settings
  - `ProjectSettings/GraphicsSettings.asset` - WebGL rendering
  - `ProjectSettings/EditorBuildSettings.asset` - Scene configuration

- [x] **Documentation**
  - `unity/fitlook-viewer/README.md` - Setup & architecture guide
  - `.gitignore` - Unity-specific exclusions

### Testing Infrastructure

- [x] **Spike Testing Tools**
  - `spike/samples.json` - 10 test products (Musinsa URLs)
  - `spike/download-tripo-samples.ts` - Batch download 3D models
  - `spike/run-weight-transfer.ts` - Batch Blender weight transfer (Phase 2)
  - `spike/weight_transfer_spike.py` - Blender automation script (Phase 2)

### Package & Build Configuration

- [x] **npm Scripts** (`package.json`)
  - `npm run spike:download` - Download test 3D models
  - `npm run spike:fit` - Test Blender weight transfer
  - `npm run build:unity` - Build WebGL viewer
  - `npm run deploy` - Build Unity + Next.js + deploy to Cloudflare

## ⚠️ Required Manual Steps

### 1. Database Migration (Neon PostgreSQL)

The migration file exists but must be applied manually:

```bash
# Option A: Via Neon Dashboard
1. Go to https://console.neon.tech
2. Select fitlook project
3. SQL Editor tab
4. Copy-paste content from: drizzle/0003_add_model_3d_url.sql
5. Execute

# Option B: Via psql CLI
psql $DATABASE_URL -f drizzle/0003_add_model_3d_url.sql
```

**SQL to execute:**
```sql
ALTER TABLE products ADD COLUMN model_3d_url text;
```

### 2. Unity Project Setup

If starting fresh with Unity:

```bash
# PowerShell (Windows)
cd unity
powershell -ExecutionPolicy Bypass -File setup-unity.ps1
```

Steps in Unity Hub:
1. Add project: `C:\Users\Jay-server\Desktop\projects\fitlook\unity\fitlook-viewer`
2. Open with Unity 2022.3 LTS
3. In editor menu: `fitlook > Setup > Create TryOn Scene`
4. In editor menu: `fitlook > Setup > Configure Build Settings`
5. Verify Package Manager has `com.unity.cloud.gltfast@6.0.0`

### 3. Test Submission (Optional)

```bash
# After both frontend and database are ready:
npm run dev
# Navigate to http://localhost:3000/products/submit
# Enter a valid image URL (e.g., from test samples)
# Watch 3D model generation in action
```

### 4. Build & Deploy

```bash
# Full deployment pipeline:
npm run build:unity    # 5-10 min (builds WebGL)
npm run build:cf       # Builds Next.js + OpenNext
npm run deploy         # Deploy to Cloudflare Pages
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    fitlook Frontend                      │
│              (Next.js 16, React 19, Tailwind)           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  /products/submit      → [SubmitProductForm]             │
│       ↓                                                   │
│  POST /api/products/generate-from-url                   │
│       │                                                   │
│       ├─→ [Web Crawler] ─→ Extract Image URL            │
│       │   (src/lib/crawl.ts)                            │
│       │                                                   │
│       └─→ [Tripo.AI Client] ─→ 3D Model (GLB)          │
│           (src/lib/tripo.ts)                            │
│                ↓                                          │
│       [Save model_3d_url to DB]                         │
│            (Neon PostgreSQL)                             │
│                ↓                                          │
│  GET /products/[id]                                      │
│       ↓                                                   │
│  <UnityViewer modelUrl="..." />                         │
│       ↓                                                   │
│  [Load WebGL] → Load Build.wasm                         │
│       ↓                                                   │
│  [Unity Instance Ready]                                  │
│       ↓                                                   │
│  unityInstance.SendMessage()                            │
│  → TryOnManager.OnLoadGarment()                         │
│  → GarmentLoader.LoadGarment()                          │
│  → glTFast.Load(modelUrl)                               │
│       ↓                                                   │
│  [3D Model Rendered on Avatar]                          │
│       ↓                                                   │
│  User: Drag to rotate, Scroll to zoom                   │
│        ↓                                                  │
│       window.onMouseDown → deltaX, deltaY               │
│       → unityInstance.SendMessage()                     │
│       → TryOnManager.OnRotateCamera()                   │
│       → CameraController.Rotate()                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🧪 Known Issues & Workarounds

### Tripo.AI API Failures

**Issue:** Spike download test returned HTML 404/error pages

**Cause:** 
- Musinsa product URLs may be blocked by CORS/rate limiting
- Extracted image URLs might not be accessible to Tripo.AI servers
- API key may need verification

**Workaround:**
- Test with direct image URLs (e.g., from image hosting services)
- Verify TRIPO_API_KEY in .env.local
- Implement retry logic with exponential backoff (Phase 2)
- Use rate limiting to respect API quotas

### Database Migration Drift

**Issue:** drizzle-kit push fails with "column 'id' is in a primary key"

**Cause:** Schema divergence between local and remote

**Resolution:** Manual SQL execution (see step 1 above)

## 📋 Integration Checklist

- [x] Frontend submission page created
- [x] Web crawler implemented (image extraction)
- [x] Tripo.AI integration complete
- [x] API endpoint ready
- [x] Database schema updated (migration file)
- [ ] **MANUAL:** Apply database migration to Neon
- [ ] **MANUAL:** Create TryOn scene in Unity (or use automated setup)
- [x] Unity C# scripts ready
- [x] WebGL bridge (jslib) implemented
- [x] React UnityViewer component created
- [x] Build automation scripts ready
- [ ] **TEST:** Verify end-to-end flow with sample product
- [ ] **DEPLOY:** Build WebGL + deploy to Cloudflare Pages

## 🚀 Next Steps (Phase 2)

1. **Cloth Physics** — Blender weight transfer + Burst compilation
   - Use spike tools: `spike/weight_transfer_spike.py`
   - Runtime physics simulation in Unity

2. **Avatar Customization**
   - Multiple avatar models (body types, skin tones)
   - Pose library expansion (sitting, jumping, etc.)

3. **Mobile AR**
   - WebXR for iOS/Android AR
   - Real-world garment placement

4. **Performance Optimization**
   - GPU-driven skinning
   - Model LOD (Level of Detail) system
   - Streaming model loading

## 📞 Support

- **Unity WebGL Issues:** Check `unity/fitlook-viewer/README.md`
- **Tripo.AI API:** https://www.tripo.ai/api/documentation
- **glTFast Docs:** https://github.com/atteneder/glTFast
- **Neon PostgreSQL:** https://neon.tech/docs
