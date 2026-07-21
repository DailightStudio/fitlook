# fitlook Virtual Try-On - Unity Project

## Project Structure
`
fitlook-viewer/
├── Assets/
│   ├── Scenes/
│   │   └── TryOn.unity (main scene)
│   ├── Scripts/
│   │   ├── AvatarController.cs
│   │   ├── GarmentLoader.cs
│   │   ├── WebGLBridge.cs
│   │   └── CameraController.cs
│   ├── Models/
│   │   └── mannequin.glb (avatar)
│   ├── Materials/
│   └── Prefabs/
├── ProjectSettings/
├── Packages/
│   └── manifest.json
└── README.md
`

## Setup Instructions

### 1. Unity 2022 LTS Installation
- Open Unity Hub
- Install Unity 2022.3 LTS
- Ensure WebGL Build Support is installed

### 2. Create Project
- File → New Project
- Path: C:\Users\Jay-server\Desktop\projects\fitlook\unity\fitlook-viewer
- 3D Template

### 3. Import glTFast
- Window → TextMesh Pro → Import TMP Essential Resources
- Window → Package Manager
- Add package from git URL:
  - com.unity.cloud.gltfast@6.0.0

### 4. Scene Setup
- Create scene: Assets/Scenes/TryOn.unity
- Create gameobjects:
  - Avatar (with Animator + AvatarController)
  - Garment (empty, will be loaded)
  - Main Camera (with CameraController)
  - WebGLBridge (manager script)

### 5. Build for WebGL
- File → Build Settings
- Switch to WebGL platform
- Add Scenes/TryOn.unity
- Player Settings:
  - Product Name: fitlook-viewer
  - Compression Format: Brotli
  - Build: Output to C:\Users\Jay-server\Desktop\projects\fitlook\.open-next\public\unity-viewer

## Scripts to Create

After Unity opens, create these scripts in Assets/Scripts/:

### AvatarController.cs
- Handles avatar animations
- Methods: PlayPose(poseId), ResetPose()
- Receives calls from WebGLBridge

### GarmentLoader.cs
- Loads glb models via glTFast
- Method: LoadGarment(url)
- Parents garment to avatar armature

### WebGLBridge.cs
- JS ↔ Unity communication via jslib
- Receives: LoadGarment(url), SetPose(poseId), RotateView(deltaX, deltaY)
- Sends: ready event

### CameraController.cs
- Orbit camera around avatar
- Methods: Rotate(deltaX, deltaY)
- Input: mouse drag or JS calls

## Next Steps

1. ✅ Unity 2022 LTS installed
2. ⏳ Create new project
3. ⏳ Import glTFast
4. ⏳ Create TryOn scene
5. ⏳ Add scripts to Assets/Scripts/
6. ⏳ Configure WebGL build
7. ⏳ Create jslib bridge
8. ⏳ Test with sample garment URL
9. ⏳ Build WebGL
10. ⏳ Integrate with fitlook Next.js site
