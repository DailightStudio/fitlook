using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneSetup
{
    [MenuItem("fitlook/Setup/Create TryOn Scene")]
    public static void CreateTryOnScene()
    {
        Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene);
        scene.name = "TryOn";

        // Create camera
        GameObject cameraGO = new GameObject("Main Camera");
        Camera camera = cameraGO.AddComponent<Camera>();
        cameraGO.AddComponent<AudioListener>();
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(0.95f, 0.95f, 0.95f, 1f);
        cameraGO.tag = "MainCamera";
        cameraGO.transform.position = new Vector3(0, 1, 2);
        cameraGO.AddComponent<CameraController>();

        // Create avatar
        GameObject avatarGO = new GameObject("Avatar");
        avatarGO.transform.position = Vector3.zero;

        // Create armature (skeleton root)
        GameObject armatureGO = new GameObject("Armature");
        armatureGO.transform.parent = avatarGO.transform;
        armatureGO.transform.localPosition = Vector3.zero;

        // Create skeleton bones
        CreateBones(armatureGO.transform);

        // Add Animator
        Animator animator = avatarGO.AddComponent<Animator>();
        AvatarController avatarController = avatarGO.AddComponent<AvatarController>();
        avatarController.armature = armatureGO.transform;

        // Create lighting
        GameObject lightGO = new GameObject("Directional Light");
        Light light = lightGO.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.2f;
        lightGO.transform.eulerAngles = new Vector3(50, -30, 0);

        // Create TryOnManager
        GameObject managerGO = new GameObject("TryOnManager");
        TryOnManager manager = managerGO.AddComponent<TryOnManager>();
        manager.avatarController = avatarController;
        manager.cameraController = cameraGO.GetComponent<CameraController>();

        // Create garment loader
        GameObject garmentLoaderGO = new GameObject("GarmentLoader");
        GarmentLoader garmentLoader = garmentLoaderGO.AddComponent<GarmentLoader>();
        garmentLoader.avatarArmature = armatureGO.transform;
        manager.garmentLoader = garmentLoader;

        // Save scene
        string scenePath = "Assets/Scenes/TryOn.unity";
        EditorSceneManager.SaveScene(scene, scenePath);
        Debug.Log($"Scene created at {scenePath}");

        // Mark avatar and related GameObjects as scene root
        EditorSceneManager.MarkSceneDirty(scene);
    }

    private static void CreateBones(Transform parent)
    {
        // Create basic humanoid skeleton
        Transform hips = CreateBone("Hips", parent);
        Transform spine = CreateBone("Spine", hips);
        Transform chest = CreateBone("Chest", spine);
        Transform neck = CreateBone("Neck", chest);
        Transform head = CreateBone("Head", neck);

        // Left arm
        Transform leftShoulder = CreateBone("LeftShoulder", chest);
        Transform leftArm = CreateBone("LeftArm", leftShoulder);
        Transform leftForeArm = CreateBone("LeftForeArm", leftArm);
        CreateBone("LeftHand", leftForeArm);

        // Right arm
        Transform rightShoulder = CreateBone("RightShoulder", chest);
        Transform rightArm = CreateBone("RightArm", rightShoulder);
        Transform rightForeArm = CreateBone("RightForeArm", rightArm);
        CreateBone("RightHand", rightForeArm);

        // Left leg
        Transform leftUpLeg = CreateBone("LeftUpLeg", hips);
        Transform leftLeg = CreateBone("LeftLeg", leftUpLeg);
        CreateBone("LeftFoot", leftLeg);

        // Right leg
        Transform rightUpLeg = CreateBone("RightUpLeg", hips);
        Transform rightLeg = CreateBone("RightLeg", rightUpLeg);
        CreateBone("RightFoot", rightLeg);
    }

    private static Transform CreateBone(string name, Transform parent)
    {
        GameObject bone = new GameObject(name);
        bone.transform.parent = parent;
        bone.transform.localPosition = Vector3.zero;
        return bone.transform;
    }

    [MenuItem("fitlook/Setup/Configure Build Settings")]
    public static void ConfigureBuildSettings()
    {
        EditorBuildSettings.scenes = new EditorBuildSettingsScene[]
        {
            new EditorBuildSettingsScene("Assets/Scenes/TryOn.unity", true)
        };

        // Set WebGL specific settings
        PlayerSettings.displayResolutionDialog = ResolutionDialogSetting.Disabled;
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
        PlayerSettings.WebGL.memorySize = 256;
        PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.ExplicitlyThrownExceptionsOnly;

        Debug.Log("Build settings configured for WebGL");
    }
}
