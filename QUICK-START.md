# fitlook Virtual Try-On Quick Start

## For Developers

### 1. Local Development

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000/products/submit
# Test with a shopping mall URL (Musinsa, etc.)
```

### 2. Database Setup (One-Time)

```bash
# Apply schema migration to Neon PostgreSQL
# Go to: https://console.neon.tech → SQL Editor
# Execute:
ALTER TABLE products ADD COLUMN model_3d_url text;
```

### 3. Unity WebGL Build (Optional)

```bash
# Only needed if modifying Unity viewer
cd unity/fitlook-viewer

# Open in Unity 2022.3 LTS
# Menu > fitlook > Setup > Create TryOn Scene
# Menu > fitlook > Setup > Configure Build Settings

# Then build:
cd ../..
npm run build:unity

# Output: .open-next/public/unity-viewer/Build/
```

### 4. Deploy to Cloudflare

```bash
# Full deployment (builds + deploys)
npm run deploy

# Access at: https://fitlook.org or https://fitlook.pages.dev
```

## API Endpoint Reference

### Generate 3D Model from URL

```bash
POST /api/products/generate-from-url
Content-Type: application/json

{
  "url": "https://www.musinsa.com/products/2900213"
}

# Response:
{
  "success": true,
  "modelUrl": "https://..../model.glb",
  "imageUrl": "https://..../product.jpg",
  "productName": "...",
  "sourceUrl": "https://www.musinsa.com/products/2900213"
}
```

## Component Usage

### React: Display 3D Viewer

```tsx
import { UnityViewer } from '@/components/products/UnityViewer';

<UnityViewer 
  modelUrl="https://tripo-models.s3.../model.glb"
  productName="Product Name"
  onError={(error) => console.error(error)}
/>
```

### Control from JavaScript

```javascript
// Rotate camera
window.unityInstance?.SendMessage('TryOnManager', 'OnRotateCamera', 
  JSON.stringify({x: 45, y: 90}));

// Change pose
window.unityInstance?.SendMessage('TryOnManager', 'OnSetPose', 'walk');

// Load new garment
window.unityInstance?.SendMessage('TryOnManager', 'OnLoadGarment', 
  'https://.../new-model.glb');
```

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://neondb_owner:...@ep-green-sunset-ao5482ib.c-2.ap-southeast-1.aws.neon.tech/neondb
TRIPO_API_KEY=tsk_k7CaKGWvvweAoN-O-kEWs1XsO3LxzKxXUjIvf2ZNsCd
APP_URL=http://localhost:3000
```

## File Structure Quick Reference

```
src/
├── app/api/products/generate-from-url/  ← 3D generation API
├── app/products/submit/                 ← Submission page
├── components/products/
│   ├── UnityViewer.tsx                  ← 3D viewer (main)
│   ├── ModelViewer.tsx                  ← Google Model Viewer (fallback)
│   └── SubmitProductForm.tsx            ← URL input form
└── lib/
    ├── tripo.ts                         ← Tripo.AI client
    └── crawl.ts                         ← Web crawler

unity/fitlook-viewer/
├── Assets/Scripts/
│   ├── AvatarController.cs              ← Animations
│   ├── GarmentLoader.cs                 ← Model loading
│   ├── CameraController.cs              ← Camera control
│   └── TryOnManager.cs                  ← Coordinator
└── Assets/Plugins/
    └── UnityWebGLBridge.jslib           ← JS ↔ Unity communication
```

## Troubleshooting

### "3D 뷰어 로드 오류"

**Cause:** WebGL build not deployed or CORS issue

**Fix:**
1. Ensure `npm run build:unity` completed
2. Check `.open-next/public/unity-viewer/Build/` exists
3. Verify Cloudflare deployment includes `/unity-viewer/` path

### Garment Doesn't Load in 3D Viewer

**Cause:** Invalid GLB URL or network issue

**Fix:**
1. Test URL in browser (should download file)
2. Verify CORS headers: `Access-Control-Allow-Origin: *`
3. Check Unity console (F12 browser dev tools)

### API Returns "3D 모델 생성에 실패했습니다"

**Cause:** Tripo.AI API error

**Possible reasons:**
- Invalid image URL (not accessible to Tripo servers)
- API key invalid/expired
- Rate limit exceeded
- Network timeout

**Fix:**
1. Verify TRIPO_API_KEY is set
2. Test with known-good image URL
3. Check `console.error()` logs in `/api/products/generate-from-url`
4. Add retry logic with exponential backoff

## Performance Tips

- **First Load:** 30-60 seconds (Tripo.AI 3D generation)
- **Subsequent Loads:** <5 seconds (cached GLB)
- **WebGL Viewer:** 2-3MB WASM, 256MB max memory
- **Optimization:** Enable Brotli compression (already configured)

## Version Info

- Next.js 16
- React 19
- Unity 2022.3.17f1
- Tripo.AI API v2
- glTFast 6.0.0
- Neon PostgreSQL

## More Details

- Full Setup: See `VIRTUAL-TRYON-SETUP.md`
- Unity Guide: See `unity/fitlook-viewer/README.md`
- Project Docs: See `README.md`
