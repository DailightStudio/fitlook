'use client';

import { useEffect, useRef } from 'react';

interface ModelViewerProps {
  modelUrl: string;
  productName: string;
}

export function ModelViewer({ modelUrl, productName }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load model-viewer script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.defer = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-lg"
    >
      {/* @ts-expect-error: model-viewer is a custom element */}
      <model-viewer
        src={modelUrl}
        alt={productName}
        auto-rotate
        camera-controls
        disable-zoom={false}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF'
        }}
      />
    </div>
  );
}
