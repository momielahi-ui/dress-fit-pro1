import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { detectPose } from '@/lib/pose-detection';

interface SmartStudio2DProps {
  modelUrl: string | null;
  garmentUrl: string | null;
  scale: number;
  widthWarp: number;
  posX: number;
  posY: number;
}

// Separate component to handle the WebGL rendering so we can use Three hooks
function GarmentMesh({ 
  garmentUrl, 
  baseWidth, 
  baseHeight, 
  keypoints, 
  userScale, 
  userWidthWarp, 
  userPosX, 
  userPosY 
}: { 
  garmentUrl: string; baseWidth: number; baseHeight: number; keypoints: any[];
  userScale: number; userWidthWarp: number; userPosX: number; userPosY: number;
}) {
  const texture = useTexture(garmentUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Transform keypoints into anchoring math
  const anchor = useMemo(() => {
    let x = 0;
    let y = baseHeight ? (baseHeight / 4) : 200; // default chest
    let autoScale = 2.0; // default larger

    if (keypoints && keypoints.length > 0) {
      const lShoulder = keypoints.find((k: any) => k.name === 'left_shoulder');
      const rShoulder = keypoints.find((k: any) => k.name === 'right_shoulder');
      // MediaPipe: left means the subject's left (which is on the right side of the photo typically)
      
      if (lShoulder && rShoulder && lShoulder.score > 0.3 && rShoulder.score > 0.3) {
        const dx = rShoulder.x - lShoulder.x;
        const dy = rShoulder.y - lShoulder.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Center of chest (slightly below shoulders)
        const px = (lShoulder.x + rShoulder.x) / 2;
        const py = (lShoulder.y + rShoulder.y) / 2;
        
        // Map from Top-Left origin to Center origin (Three.js)
        x = px - (baseWidth / 2);
        y = -(py - (baseHeight / 2)) - (dist * 0.5); // shift down half a shoulder width to center on chest

        // Increase auto-scale significantly because jerseys have wide sleeves
        autoScale = (dist * 2.8) / 300; 
      }
    }

    return { x, y, autoScale };
  }, [keypoints, baseWidth, baseHeight]);

  const finalScale = anchor.autoScale * userScale;
  const finalX = anchor.x + userPosX;
  const finalY = anchor.y - userPosY; // subtract because ThreeJS Y goes up

  return (
    <mesh 
      ref={meshRef} 
      position={[finalX, finalY, 0]} 
      scale={[finalScale * userWidthWarp, finalScale, 1]}
    >
      <WarpGeometry />
      <WrappedMaterial texture={texture} />
    </mesh>
  );
}

function WrappedMaterial({ texture }: { texture: THREE.Texture }) {
  const geoRef = useRef<THREE.PlaneGeometry>(null);

  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.dispose();
    }
  }, []);

  return (
    <meshBasicMaterial 
      map={texture} 
      transparent={true} 
      depthTest={false} 
      alphaTest={0.05}
    />
  );
}

// We mutate the geometry outside the render loop for performance
const WarpGeometry = () => {
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  useEffect(() => {
    if (geoRef.current) {
      const pos = geoRef.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        const nx = x / 150; // -1 to 1 based on 300 width
        const ny = y / 150;

        let newZ = z;
        let newY = y;

        // Bulge chest (parabolic curve outward)
        newZ += (1 - nx * nx) * (1 - ny * ny) * 30;

        // Drape corners down for shoulders (subtle)
        if (ny > 0) {
          newY -= Math.abs(nx) * 20 * ny; 
        }

        pos.setXYZ(i, x, newY, newZ);
      }
      pos.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }
  }, []);
  
  return <planeGeometry ref={geoRef} args={[300, 300, 16, 16]} />;
}


export function SmartStudio2D({ modelUrl, garmentUrl, scale, widthWarp, posX, posY }: SmartStudio2DProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [keypoints, setKeypoints] = useState<any[]>([]);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // When model changes, run AI detection
  useEffect(() => {
    let isMounted = true;
    if (!modelUrl) {
      setKeypoints([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = async () => {
      if (!isMounted) return;
      setImgSize({ w: img.width, h: img.height });
      setIsProcessing(true);
      try {
        const kp = await detectPose(img);
        if (isMounted && kp) {
          setKeypoints(kp);
        }
      } catch (err) {
        console.warn("AI Pose detection failed", err);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    };
    img.src = modelUrl;

    return () => { isMounted = false; };
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-muted/10 border border-dashed border-border rounded-xl p-8 text-center">
        <h3 className="text-lg font-display font-semibold text-foreground">No Model Selected</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Select a 2D model from the sidebar to activate AI anchoring.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative overflow-hidden flex items-center justify-center bg-background rounded-xl shadow-inner group">
      
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-display font-semibold text-primary animate-pulse text-sm">AI Anchoring Skeleton...</p>
        </div>
      )}

      {/* The base model photo renders behind, taking up the natural aspect ratio */}
      <div className="relative inline-block max-w-full" style={{ aspectRatio: imgSize.w && imgSize.h ? `${imgSize.w}/${imgSize.h}` : 'auto', maxHeight: '700px' }}>
        
        <img 
          ref={imgRef}
          src={modelUrl} 
          alt="2D Base Model" 
          className="w-full h-full object-contain"
          draggable="false"
        />

        {/* The 3D Canvas sits precisely over the image, mapping completely 1:1 using absolute positioning */}
        {garmentUrl && imgSize.w > 0 && (
          <div className="absolute inset-0 z-10 opacity-100">
            <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} orthographic camera={{ position: [0, 0, 100], zoom: 1 }}>
              {/* Match coordinate system perfectly by setting frustum sizes explicitly via ortho config, but it's simpler to just let Drei handle aspect ratio mapping, 
                  Wait, by default Canvas sizes to parent. OrthographicCamera with manual boundaries maps pixels to 3D units 1:1 */}
              <OrthographicCamera 
                makeDefault 
                left={-imgSize.w / 2} 
                right={imgSize.w / 2} 
                top={imgSize.h / 2} 
                bottom={-imgSize.h / 2} 
                near={0.1} 
                far={1000} 
                position={[0, 0, 100]} 
              />
              <ambientLight intensity={1} />
              <React.Suspense fallback={null}>
                <GarmentMesh 
                  garmentUrl={garmentUrl} 
                  baseWidth={imgSize.w}
                  baseHeight={imgSize.h}
                  keypoints={keypoints}
                  userScale={scale}
                  userWidthWarp={widthWarp}
                  userPosX={posX}
                  userPosY={posY}
                />
              </React.Suspense>
            </Canvas>
          </div>
        )}
      </div>
    </div>
  );
}
