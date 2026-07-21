'use client';

import { useEffect, useRef, useState } from 'react';

interface UnityViewerProps {
  modelUrl: string;
  productName?: string;
  onError?: (error: string) => void;
}

export function UnityViewer({ modelUrl, productName, onError }: UnityViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unityInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadUnityWebGL = async () => {
      try {
        if (!containerRef.current) return;

        // Load the Unity WebGL loader script
        const script = document.createElement('script');
        script.src = '/unity-viewer/Build/Build.loader.js';
        script.async = true;

        script.onload = async () => {
          const createUnityInstance = (window as any).createUnityInstance;

          if (!createUnityInstance) {
            throw new Error('Unity instance creator not found');
          }

          try {
            const instance = await createUnityInstance(containerRef.current, {
              dataUrl: '/unity-viewer/Build/Build.data',
              frameworkUrl: '/unity-viewer/Build/Build.framework.js',
              codeUrl: '/unity-viewer/Build/Build.wasm',
              streamingAssetsUrl: '/unity-viewer/StreamingAssets',
              companyName: 'FitLook',
              productName: 'Try-On Viewer',
              productVersion: '0.1.0',
              showBanner: false,
              matchWebGLToCanvasSize: true,
            });

            unityInstanceRef.current = instance;

            // Set up callback for when garment is loaded
            (window as any).onGarmentLoaded = (success: boolean) => {
              if (success) {
                console.log('Garment loaded successfully');
              } else {
                setError('Failed to load garment');
              }
            };

            // Set up ready callback
            (window as any).onUnityReady = () => {
              setIsLoaded(true);
              // Load the garment
              if (modelUrl && instance.SendMessage) {
                instance.SendMessage('TryOnManager', 'OnLoadGarment', modelUrl);
              }
            };
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error loading Unity instance';
            setError(message);
            onError?.(message);
          }
        };

        script.onerror = () => {
          const message = 'Failed to load Unity WebGL loader';
          setError(message);
          onError?.(message);
        };

        document.body.appendChild(script);

        return () => {
          if (script.parentElement) {
            script.parentElement.removeChild(script);
          }
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error initializing viewer';
        setError(message);
        onError?.(message);
      }
    };

    loadUnityWebGL();
  }, [modelUrl, onError]);

  // Handle mouse input for camera control
  useEffect(() => {
    if (!containerRef.current || !isLoaded || !unityInstanceRef.current) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      unityInstanceRef.current?.SendMessage('TryOnManager', 'OnRotateCamera', JSON.stringify({ x: deltaX, y: deltaY }));

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      unityInstanceRef.current?.SendMessage('TryOnManager', 'OnZoomCamera', delta);
    };

    containerRef.current.addEventListener('mousedown', onMouseDown);
    containerRef.current.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('mouseup', onMouseUp);
    containerRef.current.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      containerRef.current?.removeEventListener('mousedown', onMouseDown);
      containerRef.current?.removeEventListener('mousemove', onMouseMove);
      containerRef.current?.removeEventListener('mouseup', onMouseUp);
      containerRef.current?.removeEventListener('wheel', onWheel);
    };
  }, [isLoaded]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-surface rounded-lg border border-primary/10">
        <div className="text-center">
          <p className="text-red-500 font-semibold">3D 뷰어 로드 오류</p>
          <p className="text-sm text-ink/60 mt-2">{error}</p>
          <p className="text-xs text-ink/40 mt-4">Google Model Viewer로 대체됨</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <canvas
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: '#f5f5f5',
        }}
      />
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
          }}
        >
          3D 뷰어 로딩 중...
        </div>
      )}
    </div>
  );
}
