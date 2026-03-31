import { Suspense, useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "./ErrorBoundary";
import { Loader2 } from "lucide-react";

interface Avatar3DProps {
  garmentUrl?: string | null;
  autoRotate?: boolean;
}

export interface Avatar3DRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-muted-foreground z-10 bg-background/50 backdrop-blur-sm">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-sm font-medium hover:opacity-100 transition-opacity">Downloading 3D Assets...</span>
    </div>
  );
}

function Scene({ garmentUrl, autoRotate, controlsRef }: { garmentUrl?: string | null, autoRotate: boolean, controlsRef: any }) {
  // Use a CORS friendly URL for the Avatar
  const { scene } = useGLTF("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb");
  
  // Clone scene so multiple mounts don't share identical mutated state
  const clonedScene = scene.clone();

  useEffect(() => {
    if (!garmentUrl || !clonedScene) return;

    const loader = new THREE.TextureLoader();
    loader.load(garmentUrl, (texture) => {
      // Setup correct mappings to prevent stretching
      texture.flipY = false;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.mapping = THREE.EquirectangularReflectionMapping; 
      texture.needsUpdate = true;

      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            // Apply texture to the material
            const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
            newMat.map = texture;
            newMat.needsUpdate = true;
            mesh.material = newMat;
          }
        }
      });
    });

  }, [garmentUrl, clonedScene]);

  return (
    <group position={[0, -1.0, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1} />
      <directionalLight position={[-2, 3, -1]} intensity={0.3} />
      
      {/* 3D Model */}
      <primitive object={clonedScene} scale={1.2} />

      {/* Shadows */}
      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2} far={10} resolution={512} />
      <Environment preset="city" />
      
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        autoRotate={autoRotate}
        autoRotateSpeed={2.0}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        enableZoom={true}
        enablePan={false}
      />
    </group>
  );
}

export const Avatar3DContainer = forwardRef<Avatar3DRef, Avatar3DProps>(
  ({ garmentUrl, autoRotate = false }, ref) => {
    const controlsRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (controlsRef.current && controlsRef.current.object) {
          const camera = controlsRef.current.object as THREE.PerspectiveCamera;
          camera.position.multiplyScalar(0.85);
          controlsRef.current.update();
        }
      },
      zoomOut: () => {
        if (controlsRef.current && controlsRef.current.object) {
          const camera = controlsRef.current.object as THREE.PerspectiveCamera;
          camera.position.multiplyScalar(1.15);
          controlsRef.current.update();
        }
      },
      resetView: () => {
        if (controlsRef.current && controlsRef.current.object) {
          const camera = controlsRef.current.object as THREE.PerspectiveCamera;
          camera.position.set(0, 0.3, 2.8);
          controlsRef.current.update();
        }
      }
    }));

    // Preload the specific GLTF to prevent stuttering
    useGLTF.preload("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb");

    return (
      <div className="w-full h-full relative group">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Canvas
              camera={{ position: [0, 0.3, 2.8], fov: 45 }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
              style={{ background: "transparent" }}
            >
              <Scene garmentUrl={garmentUrl} autoRotate={autoRotate} controlsRef={controlsRef} />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }
);
