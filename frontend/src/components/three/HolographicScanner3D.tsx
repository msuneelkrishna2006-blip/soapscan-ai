import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HolographicHUDProps {
  isLocked?: boolean;
}

const HolographicHUD: React.FC<HolographicHUDProps> = ({ isLocked }) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const lockGroupRef = useRef<THREE.Group>(null);

  const themeColor = isLocked ? '#10B981' : '#14B8A6';
  const laserColor = isLocked ? '#34D399' : '#2DD4BF';
  const ring2Color = isLocked ? '#059669' : '#D4AF37';

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * (isLocked ? 1.8 : 0.7);
      ring1Ref.current.rotation.x = Math.sin(time * 0.4) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * (isLocked ? 2.2 : 1.1);
      ring2Ref.current.rotation.y = Math.cos(time * 0.3) * 0.15;
    }
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(time * (isLocked ? 4.5 : 2.2)) * 1.25;
    }
    if (lockGroupRef.current) {
      const scale = isLocked ? 1 + Math.sin(time * 8) * 0.06 : 1 + Math.sin(time * 4) * 0.03;
      lockGroupRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Rotating Targeting Ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 0.95 : 0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Metallic/Emerald Ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[1.08, 1.14, 32]} />
        <meshBasicMaterial color={ring2Color} transparent opacity={isLocked ? 0.9 : 0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Volumetric Lock-On Corner Brackets */}
      <group ref={lockGroupRef}>
        {/* Top-Left Bracket */}
        <mesh position={[-1.3, 0.9, 0]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>
        <mesh position={[-1.45, 0.75, 0]}>
          <planeGeometry args={[0.05, 0.35]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>

        {/* Top-Right Bracket */}
        <mesh position={[1.3, 0.9, 0]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>
        <mesh position={[1.45, 0.75, 0]}>
          <planeGeometry args={[0.05, 0.35]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>

        {/* Bottom-Left Bracket */}
        <mesh position={[-1.3, -0.9, 0]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>
        <mesh position={[-1.45, -0.75, 0]}>
          <planeGeometry args={[0.05, 0.35]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>

        {/* Bottom-Right Bracket */}
        <mesh position={[1.3, -0.9, 0]}>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>
        <mesh position={[1.45, -0.75, 0]}>
          <planeGeometry args={[0.05, 0.35]} />
          <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 1 : 0.85} />
        </mesh>
      </group>

      {/* Center Laser Crosshairs */}
      <mesh>
        <planeGeometry args={[0.04, 0.6]} />
        <meshBasicMaterial color={laserColor} transparent opacity={isLocked ? 1 : 0.8} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.6, 0.04]} />
        <meshBasicMaterial color={laserColor} transparent opacity={isLocked ? 1 : 0.8} />
      </mesh>

      {/* 3D Scanning Laser Plane Line */}
      <mesh ref={gridRef}>
        <planeGeometry args={[3.2, 0.04]} />
        <meshBasicMaterial color={themeColor} transparent opacity={isLocked ? 0.95 : 0.85} />
      </mesh>
    </group>
  );
};

interface HolographicScanner3DProps {
  isLocked?: boolean;
  statusText?: string;
  subText?: string;
}

export const HolographicScanner3D: React.FC<HolographicScanner3DProps> = ({
  isLocked = false,
  statusText,
  subText,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <HolographicHUD isLocked={isLocked} />
      </Canvas>
      {/* Sci-Fi HUD Coordinates Readout */}
      <div
        className={`absolute bottom-3 left-4 text-[10px] font-mono select-none tracking-widest uppercase transition-colors duration-300 ${
          isLocked ? 'text-emerald-300 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-radiant-teal/90'
        }`}
      >
        {statusText || (isLocked ? '🎯 TARGET IDENTIFIED // LOCK ACTIVE' : 'AIM: GEMMA-4 // CAM_LOCK: ACTIVE')}
      </div>
      <div
        className={`absolute bottom-3 right-4 text-[10px] font-mono select-none tracking-widest uppercase transition-colors duration-300 ${
          isLocked ? 'text-emerald-400 font-semibold' : 'text-gold-400/90'
        }`}
      >
        {subText || (isLocked ? 'STATUS: HIGH CONFIDENCE' : 'SYS_TARGET: 100% ON-DEVICE')}
      </div>
    </div>
  );
};
