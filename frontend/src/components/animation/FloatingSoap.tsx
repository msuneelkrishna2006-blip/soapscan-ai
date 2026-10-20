import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingSoapProps {
  colorHex?: string;
  className?: string;
  enableParallax?: boolean;
}

const SoapBarMesh: React.FC<{
  colorHex: string;
  pointerPos: { x: number; y: number };
}> = ({ colorHex, pointerPos }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Procedural stamp texture for the soap bar surface
  const stampTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 256);

      // Debossed text stamp
      ctx.fillStyle = '#d0d7de';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SOAPSCAN AI', 256, 110);

      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#b0b8c0';
      ctx.fillText('PURE CONSUMPTION INTELLIGENCE', 256, 160);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Gentle continuous rotation
    meshRef.current.rotation.y += delta * 0.35;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;

    // Smooth pointer parallax tilt
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointerPos.y * 0.45,
      0.06
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointerPos.x * 0.55,
      0.06
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={meshRef} castShadow receiveShadow>
          {/* Smooth rounded soap bar shape */}
          <boxGeometry args={[3.2, 1.9, 0.9, 16, 16, 16]} />
          <meshPhysicalMaterial
            color={colorHex}
            roughness={0.24}
            metalness={0.08}
            clearcoat={0.7}
            clearcoatRoughness={0.15}
            transmission={0.4}
            thickness={1.2}
            ior={1.48}
            bumpMap={stampTexture}
            bumpScale={0.015}
          />
        </mesh>
      </Float>
    </group>
  );
};

export const FloatingSoap: React.FC<FloatingSoapProps> = ({
  colorHex = '#14b8a6', // Radiant Turquoise
  className = '',
  enableParallax = true,
}) => {
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enableParallax) return;

    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointerPos({ x, y });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [enableParallax]);

  if (hasWebGLError) {
    // Elegant CSS 3D fallback
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-56 h-32 rounded-[2.5rem] bg-gradient-to-tr from-teal-600 via-teal-400 to-amber-300 shadow-[0_20px_50px_rgba(20,184,166,0.4)] border border-teal-300/40 flex items-center justify-center animate-float-gentle">
          <span className="font-mono text-xs font-bold tracking-widest text-obsidian-950/80 uppercase">
            SoapScan AI
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[340px] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onError={() => setHasWebGLError(true)}
        style={{ background: 'transparent' }}
      >
        {/* Soft Ambient Light */}
        <ambientLight intensity={0.8} />

        {/* Turquoise Rim Lighting */}
        <directionalLight position={[-4, 3, 2]} intensity={2.8} color="#2dd4bf" />

        {/* Restrained Metallic Golden Keylight */}
        <directionalLight position={[4, 4, 3]} intensity={2.4} color="#f59e0b" />

        {/* Subtle Underside Fill Light */}
        <directionalLight position={[0, -3, -1]} intensity={0.9} color="#0d9488" />

        <SoapBarMesh colorHex={colorHex} pointerPos={pointerPos} />
      </Canvas>

      {/* Subtle Ground Radial Glow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full bg-teal-500/20 blur-xl pointer-events-none" />
    </div>
  );
};
