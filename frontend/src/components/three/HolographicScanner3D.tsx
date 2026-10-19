import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HolographicRings: React.FC = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.8;
      ring1Ref.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 1.2;
      ring2Ref.current.rotation.y = Math.cos(time * 0.4) * 0.2;
    }
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(time * 2.0) * 1.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Rotating Targeting Ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Fast Segmented Ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Crosshairs */}
      <mesh>
        <planeGeometry args={[0.04, 0.6]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.6, 0.04]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.8} />
      </mesh>

      {/* 3D Scanning Laser Plane Line */}
      <mesh ref={gridRef}>
        <planeGeometry args={[3.2, 0.03]} />
        <meshBasicMaterial color="#2DD4BF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

export const HolographicScanner3D: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <HolographicRings />
      </Canvas>
    </div>
  );
};
