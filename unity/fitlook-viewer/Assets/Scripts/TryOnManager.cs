using UnityEngine;
using System.Collections.Generic;

public class TryOnManager : MonoBehaviour
{
    public GarmentLoader garmentLoader;
    public AvatarController avatarController;
    public CameraController cameraController;

    void Start()
    {
        if (garmentLoader == null)
            garmentLoader = FindObjectOfType<GarmentLoader>();
        if (avatarController == null)
            avatarController = FindObjectOfType<AvatarController>();
        if (cameraController == null)
            cameraController = FindObjectOfType<CameraController>();

        Debug.Log("TryOn Manager initialized");
        NotifyReadyToJS();
    }

    public void OnLoadGarment(string url)
    {
        Debug.Log($"Loading garment from: {url}");
        if (garmentLoader != null)
        {
            garmentLoader.LoadGarment(url);
        }
        else
        {
            Debug.LogError("GarmentLoader not found!");
        }
    }

    public void OnSetPose(string poseId)
    {
        Debug.Log($"Setting pose: {poseId}");
        if (avatarController != null)
        {
            avatarController.PlayPose(poseId);
        }
        else
        {
            Debug.LogError("AvatarController not found!");
        }
    }

    public void OnRotateCamera(string jsonData)
    {
        try
        {
            var data = JsonUtility.FromJson<CameraRotationData>(jsonData);
            OnRotateCamera(data.x, data.y);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to parse camera rotation: {e.Message}");
        }
    }

    public void OnRotateCamera(float deltaX, float deltaY)
    {
        if (cameraController != null)
        {
            cameraController.Rotate(deltaX, deltaY);
        }
        else
        {
            Debug.LogError("CameraController not found!");
        }
    }

    public void OnZoomCamera(float delta)
    {
        if (cameraController != null)
        {
            cameraController.Zoom(delta);
        }
    }

    public void OnCaptureScreenshot(string filename)
    {
        ScreenCapture.CaptureScreenshot(filename);
        Debug.Log($"Screenshot saved: {filename}");
    }

    void NotifyReadyToJS()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        OnReadyCallback();
        #endif
    }

    extern void OnReadyCallback();

    [System.Serializable]
    public class CameraRotationData
    {
        public float x;
        public float y;
    }
}
