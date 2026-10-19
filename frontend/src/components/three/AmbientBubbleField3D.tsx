import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BubbleData {
  position: [number, number, number];
  scale: number;
  speed: number;
  wobbleSpeed: number;
  seed: number;
}

const BubbleParticles: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const bubbles = useMemo<BubbleData[]>(() => {
    const list: BubbleData[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        position: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
        ],
        scale: 0.12 + Math.random() * 0.28,
        speed: 0.4 + Math.random() * 0.8,
        wobbleSpeed: 1.2 + Math.random() * 2.0,
        seed: Math.random() * 10,
      });
    }
    return list;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const b = bubbles[i];
      if (!b) return;

      // Gentle upward drift
      child.position.y += b.speed * 0.012;
      // Wobble horizontally
      child.position.x += Math.sin(time * b.wobbleSpeed + b.seed) * 0.005;

      // Reset when floating past ceiling
      if (child.position.y > 5) {
        child.position.y = -5;
        child.position.x = (Math.random() - 0.5) * 14;
      }
    });

    // Subtle global parallax based on mouse
    const targetX = (state.pointer.x * 0.5);
    const targetY = (state.pointer.y * 0.3);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
  });

  return (
    <group ref={groupRef}>
      {bubbles.map((b, i) => (
        <mesh key={i} position={b.position} scale={b.scale}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            roughness={0.05}
            ior={1.2}
            reflectivity={0.9}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
};

export const AmbientBubbleField3D: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-45">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[-6, 4, 2]} intensity={1.5} color="#14B8A6" />
        <pointLight position={[6, -4, 2]} intensity={1.2} color="#D4AF37" />
        <BubbleParticles count={40} />
      </Canvas>
    </div>
  );
};
