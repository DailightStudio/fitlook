mergeInto(LibraryManager.library, {
  LoadGarment: function(urlPtr) {
    var url = UTF8ToString(urlPtr);
    window.unityInstance.SendMessage("TryOnManager", "OnLoadGarment", url);
  },

  SetPose: function(poseIdPtr) {
    var poseId = UTF8ToString(poseIdPtr);
    window.unityInstance.SendMessage("TryOnManager", "OnSetPose", poseId);
  },

  RotateCamera: function(deltaX, deltaY) {
    window.unityInstance.SendMessage("TryOnManager", "OnRotateCamera", JSON.stringify({x: deltaX, y: deltaY}));
  },

  ZoomCamera: function(delta) {
    window.unityInstance.SendMessage("TryOnManager", "OnZoomCamera", delta);
  },

  CaptureScreenshot: function(filenamePtr) {
    var filename = UTF8ToString(filenamePtr);
    window.unityInstance.SendMessage("TryOnManager", "OnCaptureScreenshot", filename);
  },

  OnGarmentLoaded: function(success) {
    if (window.onGarmentLoaded) {
      window.onGarmentLoaded(success === 1);
    }
  },

  OnReadyCallback: function() {
    if (window.onUnityReady) {
      window.onUnityReady();
    }
  }
});
