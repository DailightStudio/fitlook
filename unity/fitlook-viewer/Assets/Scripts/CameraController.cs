using UnityEngine;

public class CameraController : MonoBehaviour
{
    private float rotationX = 0f;
    private float rotationY = 0f;
    private float sensitivity = 2f;
    private float minX = -30f;
    private float maxX = 60f;
    private Vector3 orbitCenter = Vector3.zero;
    private float orbitDistance = 2f;

    void Start()
    {
        UpdateCameraPosition();
    }

    public void Rotate(float deltaX, float deltaY)
    {
        rotationY += deltaX * sensitivity;
        rotationX -= deltaY * sensitivity;
        rotationX = Mathf.Clamp(rotationX, minX, maxX);

        UpdateCameraPosition();
    }

    public void Zoom(float delta)
    {
        orbitDistance -= delta * 0.1f;
        orbitDistance = Mathf.Clamp(orbitDistance, 1f, 5f);
        UpdateCameraPosition();
    }

    private void UpdateCameraPosition()
    {
        Quaternion rotation = Quaternion.Euler(rotationX, rotationY, 0f);
        Vector3 direction = rotation * Vector3.back;
        transform.position = orbitCenter + direction * orbitDistance;
        transform.rotation = rotation;
    }

    void Update()
    {
        // Mouse input for testing
        #if UNITY_EDITOR
        if (Input.GetMouseButton(0))
        {
            float deltaX = Input.GetAxis("Mouse X");
            float deltaY = Input.GetAxis("Mouse Y");
            Rotate(deltaX, deltaY);
        }
        #endif
    }
}
