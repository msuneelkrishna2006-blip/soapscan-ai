import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CosmicUniverse3DProps {
  warpActive?: boolean;
  onWarpComplete?: () => void;
  showSoapCore?: boolean;
  interactiveParallax?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

// Procedural high-resolution radial soft-glow circular texture (ZERO blocky squares)
function createSoftGlowOrbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(212, 175, 55, 0.95)'); // Royal Gold core
    gradient.addColorStop(0.42, 'rgba(20, 184, 166, 0.7)');  // Radiant Teal glow
    gradient.addColorStop(0.72, 'rgba(15, 118, 110, 0.25)'); // Deep Teal edge
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 5,000+ Circular Glow Stars & Gold/Teal Nebula Dust
const StarfieldSystem: React.FC<{
  count: number;
  warpActive: boolean;
  mousePos: { x: number; y: number };
}> = ({ count, warpActive, mousePos }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0));
  const glowTexture = useMemo(() => createSoftGlowOrbTexture(), []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);

    const palette = [
      new THREE.Color('#14b8a6'), // Radiant Teal
      new THREE.Color('#2dd4bf'), // Bright Cyan
      new THREE.Color('#d4af37'), // Royal Metallic Gold
      new THREE.Color('#f59e0b'), // Amber Starlight
      new THREE.Color('#ffffff'), // Pure Core White
      new THREE.Color('#38bdf8'), // Cosmic Azure
    ];

    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(10, 95);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const z = THREE.MathUtils.randFloat(-100, 35);

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r;
      pos[i * 3 + 2] = z;

      vel[i] = THREE.MathUtils.randFloat(0.05, 0.25);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    velocitiesRef.current = vel;
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const array = posAttr.array as Float32Array;
    const speed = warpActive ? 42.0 : 1.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 2;
      const baseVel = velocitiesRef.current[i] || 0.1;
      array[idx] += baseVel * speed * delta * 60;

      if (array[idx] > 28) {
        array[idx] = -100;
      }
    }
    posAttr.needsUpdate = true;

    // Smooth subtle rotation + lerped mouse parallax
    pointsRef.current.rotation.z += delta * 0.02 * (warpActive ? 4.5 : 1.0);
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      mousePos.y * 0.18,
      0.06
    );
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      mousePos.x * 0.18,
      0.06
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={warpActive ? 3.2 : 0.85}
        vertexColors
        map={glowTexture}
        transparent
        alphaTest={0.01}
        opacity={warpActive ? 1.0 : 0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3D Orbital Rings & Floating Crystalline Soap Core
const GyroscopeSoapCore: React.FC<{ mousePos: { x: number; y: number }; warpActive: boolean }> = ({ mousePos, warpActive }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const crystalCoreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (rootGroupRef.current) {
      if (warpActive) {
        // Hyperspace Warp: Scale up through the camera viewport and fade out
        rootGroupRef.current.scale.lerp(new THREE.Vector3(5.5, 5.5, 5.5), delta * 8);
        rootGroupRef.current.position.z = THREE.MathUtils.lerp(rootGroupRef.current.position.z, 8, delta * 9);
      } else {
        rootGroupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 4);
        rootGroupRef.current.position.z = THREE.MathUtils.lerp(rootGroupRef.current.position.z, -4, delta * 4);
      }
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * (warpActive ? 2.5 : 0.35);
      outerRingRef.current.rotation.y += delta * (warpActive ? 2.0 : 0.25);
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y -= delta * (warpActive ? 3.0 : 0.45);
      midRingRef.current.rotation.z += delta * (warpActive ? 2.2 : 0.3);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * (warpActive ? 3.8 : 0.6);
      innerRingRef.current.rotation.x += delta * (warpActive ? 2.8 : 0.4);
    }
    if (crystalCoreRef.current) {
      crystalCoreRef.current.rotation.y += delta * (warpActive ? 3.2 : 0.5);
      crystalCoreRef.current.rotation.x = THREE.MathUtils.lerp(
        crystalCoreRef.current.rotation.x,
        mousePos.y * 0.6,
        0.05
      );
      crystalCoreRef.current.rotation.z = THREE.MathUtils.lerp(
        crystalCoreRef.current.rotation.z,
        -mousePos.x * 0.6,
        0.05
      );
    }
  });

  return (
    <Float speed={warpActive ? 6.0 : 2.2} rotationIntensity={0.6} floatIntensity={1.2}>
      <group ref={rootGroupRef} position={[0, 0, -4]}>
        {/* Outer Golden Gyroscope Ring */}
        <group ref={outerRingRef}>
          <mesh>
            <torusGeometry args={[3.2, 0.035, 16, 100]} />
            <meshStandardMaterial
              color="#d4af37"
              emissive="#d4af37"
              emissiveIntensity={warpActive ? 1.2 : 0.4}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Middle Radiant Teal Ring */}
        <group ref={midRingRef}>
          <mesh>
            <torusGeometry args={[2.5, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#14b8a6"
              emissiveIntensity={warpActive ? 1.4 : 0.5}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* Inner Electric Cyan Ring */}
        <group ref={innerRingRef}>
          <mesh>
            <torusGeometry args={[1.8, 0.025, 16, 100]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#06b6d4"
              emissiveIntensity={warpActive ? 1.6 : 0.6}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        </group>

        {/* Floating Translucent Iridescent Soap Core */}
        <mesh ref={crystalCoreRef}>
          <octahedronGeometry args={[1.0, 2]} />
          <meshPhysicalMaterial
            color="#e6b84c"
            emissive="#14b8a6"
            emissiveIntensity={warpActive ? 0.9 : 0.25}
            transmission={0.8}
            opacity={warpActive ? 0.35 : 0.88}
            transparent
            roughness={0.1}
            metalness={0.15}
            ior={1.45}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
};

export const CosmicUniverse3D: React.FC<CosmicUniverse3DProps> = ({
  warpActive = false,
  onWarpComplete,
  showSoapCore = true,
  interactiveParallax = true,
  intensity = 'medium',
}) => {
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const starCount = intensity === 'high' ? 6500 : intensity === 'medium' ? 5000 : 3200;

  useEffect(() => {
    if (!interactiveParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactiveParallax]);

  useEffect(() => {
    if (warpActive && onWarpComplete) {
      const timer = setTimeout(() => {
        onWarpComplete();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [warpActive, onWarpComplete]);


  // CSS 3D Fallback if WebGL context is unavailable
  if (hasWebGLError) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03090E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(20,184,166,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.15),transparent_60%)]" />
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03090E] transition-opacity duration-1000 ${
        warpActive ? 'scale-105 transition-transform duration-700 ease-in' : ''
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => {}}
        onError={() => setHasWebGLError(true)}
      >
        {/* Volumetric Cosmic Lights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={2.5} color="#d4af37" />
        <pointLight position={[-12, -10, -5]} intensity={2.0} color="#14b8a6" />
        <pointLight position={[0, -15, 5]} intensity={1.8} color="#06b6d4" />

        {/* 5,000+ Smooth Circular Glow Stars */}
        <StarfieldSystem count={starCount} warpActive={warpActive} mousePos={mousePos} />

        {/* 3D Orbital Rings & Iridescent Crystalline Soap Core */}
        {showSoapCore && <GyroscopeSoapCore mousePos={mousePos} warpActive={warpActive} />}
      </Canvas>

      {/* Subtle Cosmic Vignette & Color Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#03090E] via-transparent to-[#03090E]/60" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,9,14,0.75)_100%)]" />
    </div>
  );
};
