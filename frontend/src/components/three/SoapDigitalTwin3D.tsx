import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { InventoryItem } from '../../types/soap';

interface SoapDigitalTwin3DProps {
  item: InventoryItem;
  height?: number | string;
  autoRotate?: boolean;
  interactive?: boolean;
}

// 3D Solid Soap Bar Mesh with Real-Time Depletion Morphing
const SolidSoapBar: React.FC<{ item: InventoryItem; depletionRatio: number }> = ({
  item,
  depletionRatio,
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Subtle breathing / floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  // Brand-specific colors & materials
  const soapTheme = useMemo(() => {
    const brandLower = item.brand.toLowerCase();
    if (brandLower.includes('dove')) {
      return {
        color: '#f8fafc',
        roughness: 0.18,
        metalness: 0.05,
        transmission: 0.2,
        clearcoat: 0.8,
        labelColor: '#0284c7',
      };
    } else if (brandLower.includes('dettol')) {
      return {
        color: '#eab308',
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.4,
        clearcoat: 0.9,
        labelColor: '#15803d',
      };
    } else if (brandLower.includes('pears')) {
      return {
        color: '#d97706',
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.7, // Glycerine transparency
        clearcoat: 1.0,
        labelColor: '#451a03',
      };
    } else if (brandLower.includes('santoor')) {
      return {
        color: '#f97316',
        roughness: 0.22,
        metalness: 0.05,
        transmission: 0.15,
        clearcoat: 0.6,
        labelColor: '#7c2d12',
      };
    } else {
      return {
        color: '#14b8a6',
        roughness: 0.2,
        metalness: 0.08,
        transmission: 0.3,
        clearcoat: 0.8,
        labelColor: '#071318',
      };
    }
  }, [item.brand]);

  // Height and thickness scale derived from actual remaining quantity
  const barHeight = Math.max(0.12, 0.75 * depletionRatio);
  const barWidth = 2.2;
  const barDepth = 1.4;

  return (
    <group ref={meshRef}>
      {/* Wooden / Ceramic Soap Dish Tray */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[1.5, 1.4, 0.12, 32]} />
        <meshStandardMaterial color="#0f2b35" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* 3D Soap Bar with Rounded Edges */}
      <RoundedBox
        args={[barWidth, barHeight, barDepth]}
        radius={0.2}
        smoothness={6}
        position={[0, barHeight / 2 - 0.38, 0]}
      >
        <meshPhysicalMaterial
          color={soapTheme.color}
          roughness={soapTheme.roughness}
          metalness={soapTheme.metalness}
          transmission={soapTheme.transmission}
          ior={1.35}
          clearcoat={soapTheme.clearcoat}
          clearcoatRoughness={0.1}
          reflectivity={0.6}
        />
      </RoundedBox>

      {/* 3D Embossed Brand Logo on Soap Top Face */}
      {depletionRatio > 0.15 && (
        <Text
          position={[0, barHeight - 0.35, 0.02]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.28}
          color={soapTheme.labelColor}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.7}
        >
          {item.brand.toUpperCase()}
        </Text>
      )}

      {/* Water droplets around soap base */}
      <mesh position={[0.7, -0.37, 0.5]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} />
      </mesh>
      <mesh position={[-0.6, -0.37, -0.4]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} />
      </mesh>
    </group>
  );
};

// 3D Liquid Handwash Pump Dispenser Bottle with Real Physical Fluid Level
const LiquidDispenserBottle: React.FC<{ item: InventoryItem; depletionRatio: number }> = ({
  item,
  depletionRatio,
}) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const liquidHeight = Math.max(0.08, 1.6 * depletionRatio);
  const liquidY = -0.8 + liquidHeight / 2;

  return (
    <group ref={meshRef}>
      {/* Translucent Glass / Plastic Bottle Outer Shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 1.8, 32]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.88}
          roughness={0.08}
          ior={1.45}
          thickness={0.5}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Dynamic Internal Soap Liquid Level */}
      <mesh position={[0, liquidY, 0]}>
        <cylinderGeometry args={[0.66, 0.7, liquidHeight, 32]} />
        <meshStandardMaterial
          color="#14B8A6"
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Chrome Pump Collar & Nozzle */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.22, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.35, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.2, 1.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.45, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Internal Suction Straw */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.7, 12]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export const SoapDigitalTwin3D: React.FC<SoapDigitalTwin3DProps> = ({
  item,
  height = 240,
  autoRotate = true,
  interactive = true,
}) => {
  const isLiquid = item.productType === 'liquid_handwash' || item.productType === 'body_wash';
  const depletionRatio = item.initialQuantity > 0 ? item.remainingQuantity / item.initialQuantity : 0;
  const remainingPct = Math.round(depletionRatio * 100);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-obsidian-950/80 to-obsidian-900 border border-teal-900/30 group"
      style={{ height }}
    >
      {/* 3D Canvas Scene */}
      <Canvas
        camera={{ position: [0, 1.8, 3.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color="#14B8A6" />
        <pointLight position={[3, 2, -2]} intensity={0.5} color="#D4AF37" />

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          {isLiquid ? (
            <LiquidDispenserBottle item={item} depletionRatio={depletionRatio} />
          ) : (
            <SolidSoapBar item={item} depletionRatio={depletionRatio} />
          )}
        </Float>

        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.4}
          scale={4}
          blur={1.8}
          far={1.2}
          color="#071318"
        />

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.8}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 4}
          />
        )}
      </Canvas>

      {/* Real-time 3D Digital Twin Overlay Telemetry */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-obsidian-950/80 border border-teal-800/40 backdrop-blur">
          <span className="w-1.5 h-1.5 rounded-full bg-radiant-teal animate-pulse" />
          <span className="text-[10px] font-mono text-radiant-teal font-semibold">
            3D DIGITAL TWIN
          </span>
        </div>

        <div className="px-2 py-0.5 rounded-full bg-obsidian-950/80 border border-teal-800/40 backdrop-blur font-mono text-[11px] font-bold text-white">
          {item.remainingQuantity} {item.unit} ({remainingPct}%)
        </div>
      </div>

      {/* Drag to rotate hint */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] text-slate-400 bg-obsidian-950/80 px-2.5 py-1 rounded-full border border-teal-900/40 backdrop-blur">
          Drag to inspect 360° geometry
        </span>
      </div>
    </div>
  );
};
