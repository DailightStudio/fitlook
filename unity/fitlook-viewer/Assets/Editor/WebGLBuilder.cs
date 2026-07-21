using UnityEditor;
using UnityEditor.SceneManagement;
using System.IO;

public class WebGLBuilder
{
    private static string BUILD_PATH = "../../.open-next/public/unity-viewer";

    [MenuItem("Build/WebGL Build")]
    public static void BuildWebGL()
    {
        string[] scenes = { "Assets/Scenes/TryOn.unity" };
        string buildPath = Path.Combine(Application.persistentDataPath, "..", "..", BUILD_PATH, "Build");

        if (!Directory.Exists(buildPath))
        {
            Directory.CreateDirectory(buildPath);
        }

        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
        buildPlayerOptions.scenes = scenes;
        buildPlayerOptions.locationPathName = buildPath;
        buildPlayerOptions.target = BuildTarget.WebGL;
        buildPlayerOptions.options = BuildOptions.None;

        // Set WebGL-specific player settings
        EditorBuildSettings.scenes = new EditorBuildSettingsScene[scenes.Length];
        for (int i = 0; i < scenes.Length; i++)
        {
            EditorBuildSettings.scenes[i] = new EditorBuildSettingsScene(scenes[i], true);
        }

        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
        PlayerSettings.WebGL.memorySize = 256;
        PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.ExplicitlyThrownExceptionsOnly;

        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);

        if (report.summary.result == BuildResult.Succeeded)
        {
            UnityEngine.Debug.Log("WebGL build succeeded!");
        }
        else
        {
            UnityEngine.Debug.LogError("WebGL build failed!");
        }
    }

    public static void BuildWebGLHeadless()
    {
        BuildWebGL();
    }
}
