using UnityEngine;
using System.Collections;
using GLTFast;

public class GarmentLoader : MonoBehaviour
{
    private GltfImport gltfImport;
    private GameObject currentGarment;
    public Transform avatarArmature;

    public void LoadGarment(string url)
    {
        Debug.Log($"Loading garment from: {url}");
        StartCoroutine(LoadGarmentAsync(url));
    }

    private System.Collections.IEnumerator LoadGarmentAsync(string url)
    {
        // Unload previous garment
        if (currentGarment != null)
        {
            Destroy(currentGarment);
        }

        gltfImport = new GltfImport();
        var task = gltfImport.Load(url);

        yield return new WaitUntil(() => task.IsCompleted);

        if (gltfImport.isLoaded)
        {
            currentGarment = new GameObject("Garment");
            currentGarment.transform.parent = avatarArmature ?? transform;
            currentGarment.transform.localPosition = Vector3.zero;
            currentGarment.transform.localRotation = Quaternion.identity;

            yield return gltfImport.InstantiateMainScene(currentGarment.transform);

            Debug.Log("Garment loaded successfully");
            OnGarmentLoaded?.Invoke();
        }
        else
        {
            Debug.LogError("Failed to load garment");
        }
    }

    public void UnloadGarment()
    {
        if (currentGarment != null)
        {
            Destroy(currentGarment);
            currentGarment = null;
        }
    }

    public delegate void OnGarmentLoadedDelegate();
    public event OnGarmentLoadedDelegate OnGarmentLoaded;
}
