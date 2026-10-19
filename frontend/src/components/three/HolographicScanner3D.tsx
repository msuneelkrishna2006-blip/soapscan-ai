import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HolographicHUD: React.FC = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const lockGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.7;
      ring1Ref.current.rotation.x = Math.sin(time * 0.4) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 1.1;
      ring2Ref.current.rotation.y = Math.cos(time * 0.3) * 0.15;
    }
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(time * 2.2) * 1.25;
    }
    if (lockGroupRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.03;
      lockGroupRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Rotating Targeting Ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.5, 1.54, 64]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Metallic Gold Ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[1.08, 1.12, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Volumetric Lock-On Corner Brackets */}
      <group ref={lockGroupRef}>
        {/* Top-Left Bracket */}
        <mesh position={[-1.3, 0.9, 0]}>
          <planeGeometry args={[0.3, 0.04]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>
        <mesh position={[-1.43, 0.77, 0]}>
          <planeGeometry args={[0.04, 0.3]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>

        {/* Top-Right Bracket */}
        <mesh position={[1.3, 0.9, 0]}>
          <planeGeometry args={[0.3, 0.04]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>
        <mesh position={[1.43, 0.77, 0]}>
          <planeGeometry args={[0.04, 0.3]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>

        {/* Bottom-Left Bracket */}
        <mesh position={[-1.3, -0.9, 0]}>
          <planeGeometry args={[0.3, 0.04]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>
        <mesh position={[-1.43, -0.77, 0]}>
          <planeGeometry args={[0.04, 0.3]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>

        {/* Bottom-Right Bracket */}
        <mesh position={[1.3, -0.9, 0]}>
          <planeGeometry args={[0.3, 0.04]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>
        <mesh position={[1.43, -0.77, 0]}>
          <planeGeometry args={[0.04, 0.3]} />
          <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
        </mesh>
      </group>

      {/* Center Laser Crosshairs */}
      <mesh>
        <planeGeometry args={[0.03, 0.5]} />
        <meshBasicMaterial color="#2DD4BF" transparent opacity={0.8} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.5, 0.03]} />
        <meshBasicMaterial color="#2DD4BF" transparent opacity={0.8} />
      </mesh>

      {/* 3D Scanning Laser Plane Line */}
      <mesh ref={gridRef}>
        <planeGeometry args={[3.2, 0.03]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.85} />
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
        <HolographicHUD />
      </Canvas>
      {/* Sci-Fi HUD Coordinates Readout */}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono text-radiant-teal/90 select-none tracking-widest uppercase">
        AIM: GEMMA-4 // CAM_LOCK: ACTIVE
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] font-mono text-gold-400/90 select-none tracking-widest uppercase">
        SYS_TARGET: 100% ON-DEVICE
      </div>
    </div>
  );
};
