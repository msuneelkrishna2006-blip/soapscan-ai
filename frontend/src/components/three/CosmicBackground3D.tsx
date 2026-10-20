import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CosmicBackgroundProps {
  mode?: 'login' | 'ambient';
  intensity?: 'low' | 'medium' | 'high';
  warpSpeed?: boolean;
  onWarpComplete?: () => void;
}

// Procedural high-resolution radial soft-glow circular texture (Fixes blocky square pixels!)
function createCircularGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(220, 255, 255, 0.9)');
    gradient.addColorStop(0.42, 'rgba(0, 242, 254, 0.55)');
    gradient.addColorStop(0.7, 'rgba(0, 229, 163, 0.18)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Multi-layered Starfield with Smooth Glowing Star Orbs
const Starfield: React.FC<{ count: number; warpSpeed: boolean }> = ({ count, warpSpeed }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0));
  const glowTexture = useMemo(() => createCircularGlowTexture(), []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);

    const palette = [
      new THREE.Color('#00f2fe'), // Radiant Cyan
      new THREE.Color('#4facfe'), // Electric Blue
      new THREE.Color('#00e5a3'), // Cosmic Emerald
      new THREE.Color('#c084fc'), // Aurora Violet
      new THREE.Color('#ffffff'), // Pure White
      new THREE.Color('#ffd166'), // Starlight Gold
    ];

    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(12, 85);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const z = THREE.MathUtils.randFloat(-90, 45);

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r;
      pos[i * 3 + 2] = z;

      vel[i] = THREE.MathUtils.randFloat(0.04, 0.22);

      const pickedColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = pickedColor.r;
      col[i * 3 + 1] = pickedColor.g;
      col[i * 3 + 2] = pickedColor.b;
    }

    velocitiesRef.current = vel;
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const array = posAttr.array as Float32Array;
    const speedMultiplier = warpSpeed ? 38.0 : 1.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 2;
      const baseVel = velocitiesRef.current[i] || 0.1;
      array[idx] += baseVel * speedMultiplier * delta * 60;

      // Wrap around seamlessly
      if (array[idx] > 25) {
        array[idx] = -90;
      }
    }
    posAttr.needsUpdate = true;

    // Slow ambient rotation
    pointsRef.current.rotation.z += delta * 0.018 * (warpSpeed ? 2.5 : 1.0);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture}
        size={warpSpeed ? 2.8 : 1.6}
        vertexColors
        transparent
        opacity={0.92}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  );
};

// Orbital Holographic Rings
const OrbitalHoloRings: React.FC = () => {
  const ring1 = useRef<THREE.Group>(null);
  const ring2 = useRef<THREE.Group>(null);
  const ring3 = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.12;
    if (ring2.current) {
      ring2.current.rotation.x += delta * 0.08;
      ring2.current.rotation.y += delta * 0.1;
    }
    if (ring3.current) {
      ring3.current.rotation.y -= delta * 0.14;
      ring3.current.rotation.z -= delta * 0.06;
    }
  });

  return (
    <group position={[0, 0, -8]}>
      {/* Ring 1 - Cyan Holographic */}
      <group ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[8.0, 0.035, 16, 120]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.38} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Ring 2 - Cosmic Violet */}
      <group ref={ring2} rotation={[0, Math.PI / 3, 0]}>
        <mesh>
          <torusGeometry args={[10.5, 0.028, 16, 120]} />
          <meshBasicMaterial color="#b388ff" transparent opacity={0.32} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Ring 3 - Radiant Emerald */}
      <group ref={ring3} rotation={[-Math.PI / 6, 0, Math.PI / 4]}>
        <mesh>
          <torusGeometry args={[12.8, 0.028, 16, 120]} />
          <meshBasicMaterial color="#00e5a3" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
};

// Floating Translucent Soap Crystal Centerpiece for Auth Portal
const FloatingSoapCrystal: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.28;
    meshRef.current.rotation.y += delta * 0.42;

    // Mouse parallax reaction
    const targetX = state.pointer.x * 1.4;
    const targetY = state.pointer.y * 1.0;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);

    if (haloRef.current) {
      haloRef.current.position.copy(meshRef.current.position);
      haloRef.current.rotation.x = -meshRef.current.rotation.x * 0.8;
      haloRef.current.rotation.y = -meshRef.current.rotation.y * 0.8;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.0}>
      {/* Outer Holographic Blueprint Halo */}
      <mesh ref={haloRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[2.4, 1]} />
        <meshBasicMaterial
          color="#00f2fe"
          wireframe
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Primary Translucent Soap Crystal (Glycerin Refraction) */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <octahedronGeometry args={[1.9, 2]} />
        <meshPhysicalMaterial
          color="#00e5a3"
          emissive="#002b22"
          roughness={0.1}
          metalness={0.08}
          transmission={0.9} // Glassy translucency
          thickness={1.6}
          ior={1.48} // Refraction like glycerin soap
          transparent
          opacity={0.88}
          reflectivity={0.95}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>
    </Float>
  );
};

// Camera Controller with Sleek Radial Warp-Speed Starlight Streaks
const CameraRig: React.FC<{ warpSpeed: boolean; onWarpComplete?: () => void }> = ({
  warpSpeed,
  onWarpComplete,
}) => {
  const targetZRef = useRef(15);

  useEffect(() => {
    if (warpSpeed) {
      targetZRef.current = -32;
      const timer = setTimeout(() => {
        onWarpComplete?.();
      }, 950);
      return () => clearTimeout(timer);
    } else {
      targetZRef.current = 15;
    }
  }, [warpSpeed, onWarpComplete]);

  useFrame((state, delta) => {
    if (warpSpeed) {
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        targetZRef.current,
        delta * 6.0
      );
      if ('fov' in state.camera) {
        const pCam = state.camera as THREE.PerspectiveCamera;
        pCam.fov = THREE.MathUtils.lerp(pCam.fov, 115, delta * 5.0);
      }
      state.camera.updateProjectionMatrix();
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        state.pointer.x * 0.9,
        0.05
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        state.pointer.y * 0.7,
        0.05
      );
      state.camera.position.z = THREE.MathUtils.lerp(
        state.camera.position.z,
        targetZRef.current,
        0.08
      );
    }
  });

  return null;
};

export const CosmicBackground3D: React.FC<CosmicBackgroundProps> = ({
  mode = 'ambient',
  intensity = 'medium',
  warpSpeed = false,
  onWarpComplete,
}) => {
  const starCount = useMemo(() => {
    if (intensity === 'low') return 700;
    if (intensity === 'high') return 3000;
    return 1600;
  }, [intensity]);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 25%, #051928 0%, #030d17 48%, #01060b 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: mode === 'login' ? 'auto' : 'none' }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[10, 12, 10]} intensity={1.6} color="#00f2fe" />
        <pointLight position={[-10, -10, -5]} intensity={1.3} color="#b388ff" />
        <directionalLight position={[0, 10, 5]} intensity={0.8} color="#00e5a3" />

        <CameraRig warpSpeed={warpSpeed} onWarpComplete={onWarpComplete} />

        {/* 3D Starfield with Circular Glowing Orbs */}
        <Starfield count={starCount} warpSpeed={warpSpeed} />

        {/* 3D Holographic Orbit Rings */}
        <OrbitalHoloRings />

        {/* Floating Centerpiece Translucent Soap Crystal on Login */}
        {mode === 'login' && <FloatingSoapCrystal />}
      </Canvas>

      {/* Volumetric Cosmic Aurora and Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/85 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-radiant-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};
