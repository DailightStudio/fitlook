using UnityEngine;
using UnityEngine.Animations;

public class AvatarController : MonoBehaviour
{
    private Animator animator;
    public Transform armature;
    private bool isIdleMode = true;

    void Start()
    {
        animator = GetComponent<Animator>();
        if (animator == null)
        {
            animator = GetComponentInChildren<Animator>();
        }
    }

    // Called from JS via jslib SendMessage
    public void PlayPose(string poseId)
    {
        if (animator == null) return;

        switch (poseId)
        {
            case "idle":
                isIdleMode = true;
                animator.SetFloat("Speed", 0f);
                break;
            case "walk":
                isIdleMode = false;
                animator.SetFloat("Speed", 1f);
                break;
            case "turn_left":
                animator.SetFloat("Turn", -1f);
                break;
            case "turn_right":
                animator.SetFloat("Turn", 1f);
                break;
        }
    }

    public void ResetPose()
    {
        if (animator == null) return;
        animator.SetFloat("Speed", 0f);
        animator.SetFloat("Turn", 0f);
        isIdleMode = true;
    }
}
