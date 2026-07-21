# FitLook 3D Try-On Viewer (Unity WebGL)

Virtual try-on system for fitting 3D clothing models onto avatars. Rendered as WebGL for browser compatibility.

## Setup

### Prerequisites

- Unity 2022.3 LTS or later
- Node.js 18+ (for build scripts)
- PowerShell (for build automation on Windows)

### Initial Setup

1. **Open Unity Hub** and add this project:
   ```
   C:\Users\Jay-server\Desktop\projects\fitlook\unity\fitlook-viewer
   ```

2. **Install Dependencies** in Package Manager:
   - Add `com.unity.cloud.gltfast@6.0.0` for runtime glTF/glb loading

3. **Create Scene** (or run from Unity):
   - Go to `fitlook > Setup > Create TryOn Scene`
   - Creates scene with: Avatar, Camera, Lighting, TryOnManager

4. **Configure Build Settings**:
   - Go to `fitlook > Setup > Configure Build Settings`
   - Sets WebGL platform, compression, memory budget

## Architecture

### Scripts

- **TryOnManager.cs** — Main coordinator
  - Bridges between JS and Unity components
  - Handles JSON serialization for cross-boundary data
  - Routes commands to Avatar, Camera, Garment loaders

- **AvatarController.cs** — Avatar animations
  - Animator control for poses (idle, walk, turn)
  - Bone structure reference for garment attachment

- **GarmentLoader.cs** — 3D model loading
  - Async glTFast import from URLs
  - Parents garment mesh to avatar armature
  - Handles cleanup of previous garments

- **CameraController.cs** — Orbit camera
  - Free rotation around avatar (X: -30° to 60°, Y: unrestricted)
  - Zoom in/out with distance clamping
  - Mouse input support for editor testing

### JavaScript Bridge

**File:** `Assets/Plugins/UnityWebGLBridge.jslib`

Enables bidirectional communication between Next.js frontend and Unity WebGL:

```javascript
// From React:
unityInstance.SendMessage('TryOnManager', 'OnLoadGarment', 'https://...');
unityInstance.SendMessage('TryOnManager', 'OnSetPose', 'idle');
unityInstance.SendMessage('TryOnManager', 'OnRotateCamera', JSON.stringify({x: 45, y: 90}));

// To React:
window.onGarmentLoaded(true/false);
window.onUnityReady();
```

## Building

### From Unity Editor

1. File > Build Settings
2. Switch to WebGL
3. Build to `.open-next/public/unity-viewer/Build`

### From Command Line

```bash
# PowerShell
npm run build:unity

# Or manual
powershell -ExecutionPolicy Bypass -File scripts/build-unity.ps1
```

Output: `.open-next/public/unity-viewer/Build/`

### Build Configuration

- **Compression:** Brotli (reduces build from ~100MB to ~25MB)
- **Memory:** 256MB (adjustable in PlayerSettings)
- **WebGL Version:** 2.0
- **Exception Support:** Explicitly thrown only (reduces overhead)

## Integration with fitlook

### React Component

```tsx
import { UnityViewer } from '@/components/products/UnityViewer';

<UnityViewer modelUrl="https://..." onError={(e) => console.error(e)} />
```

Features:
- Automatic fallback to Google Model Viewer on load error
- Mouse controls: drag to rotate, scroll to zoom
- Loading state and error handling

### API Flow

1. User submits product URL → `/api/products/generate-from-url`
2. Extract image + call Tripo.AI for 3D model generation
3. Model stored as `model_3d_url` in products table
4. Frontend loads Unity viewer with model URL
5. Unity viewer streams garment mesh to avatar

## Deployment

### Cloudflare Pages + Workers

1. Build WebGL: `npm run build:unity`
2. Build Next.js: `opennextjs-cloudflare build`
3. Deploy: `wrangler pages deploy`

The WebGL build is served as static assets from `public/unity-viewer/`.

## Troubleshooting

### Canvas/Memory Issues

If WebGL fails to initialize:
- Reduce `memorySize` in PlayerSettings (try 128MB)
- Disable exception support (already minimal)
- Check browser console for errors

### Model Loading Fails

- Verify GLB URL is publicly accessible
- Check CORS headers on hosting server
- Test with Google Model Viewer first

### Build Takes Too Long

- Disable debug symbols (WebGL-specific)
- Reduce texture quality/resolution
- Use incremental builds

## Future Enhancements (Phase 2)

- **Cloth Physics:** Blender weight transfer + Burst compilation
- **Pose Library:** More avatar animations (sitting, laying, poses)
- **AR Mode:** Mobile AR try-on via WebXR
- **Performance:** GPU-driven skinning for multiple garments

## References

- [glTFast Documentation](https://github.com/atteneder/glTFast)
- [Unity WebGL Best Practices](https://docs.unity3d.com/Manual/webgl-gettingstarted.html)
- [Tripo.AI API](https://www.tripo.ai/api/documentation)
