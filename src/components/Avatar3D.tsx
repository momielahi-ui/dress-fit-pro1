import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface MannequinProps {
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
}

function Mannequin({ skinColor, shirtColor, pantsColor }: MannequinProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const skin = new THREE.Color(skinColor);
  const shirt = new THREE.Color(shirtColor);
  const pants = new THREE.Color(pantsColor);

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.22, 0.4, 16, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.32, 1.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.32, 1.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-0.35, 1.1, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[0.35, 1.1, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>

      {/* Left Forearm */}
      <mesh position={[-0.4, 0.82, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.05, 0.25, 8, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Right Forearm */}
      <mesh position={[0.4, 0.82, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.05, 0.25, 8, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Hips / Waist */}
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.2, 0.15, 16, 16]} />
        <meshStandardMaterial color={pants} roughness={0.7} />
      </mesh>

      {/* Left Thigh */}
      <mesh position={[-0.12, 0.45, 0]}>
        <capsuleGeometry args={[0.09, 0.3, 8, 16]} />
        <meshStandardMaterial color={pants} roughness={0.7} />
      </mesh>

      {/* Right Thigh */}
      <mesh position={[0.12, 0.45, 0]}>
        <capsuleGeometry args={[0.09, 0.3, 8, 16]} />
        <meshStandardMaterial color={pants} roughness={0.7} />
      </mesh>

      {/* Left Shin */}
      <mesh position={[-0.12, 0.12, 0]}>
        <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
        <meshStandardMaterial color={pants} roughness={0.7} />
      </mesh>

      {/* Right Shin */}
      <mesh position={[0.12, 0.12, 0]}>
        <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
        <meshStandardMaterial color={pants} roughness={0.7} />
      </mesh>

      {/* Left Foot */}
      <mesh position={[-0.12, -0.08, 0.04]}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Right Foot */}
      <mesh position={[0.12, -0.08, 0.04]}>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface Avatar3DProps {
  skinColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  className?: string;
}

export function Avatar3D({
  skinColor = "#c68642",
  shirtColor = "#4a90d9",
  pantsColor = "#2c3e50",
  className = "",
}: Avatar3DProps) {
  return (
    <div className={`w-full aspect-[3/4] ${className}`}>
      <Canvas
        camera={{ position: [0, 0.3, 2.8], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={1} />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} />
        <Mannequin
          skinColor={skinColor}
          shirtColor={shirtColor}
          pantsColor={pantsColor}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
