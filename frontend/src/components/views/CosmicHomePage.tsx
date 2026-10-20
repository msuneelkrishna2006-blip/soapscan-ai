import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles,
  Camera,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  Scale,
  Zap,
  Box,
  Droplet,
  Barcode,
  Eye,
} from 'lucide-react';
import { TiltCard3D } from '../ui/TiltCard3D';
import { AIStatus } from '../../types/soap';
import { staggerContainer, staggerItem, springPhysics } from '../../lib/motionVariants';

// Mini 3D Orbital Planet with Interactive Gyroscopic Rings
const HeroOrbitalPlanet: React.FC = () => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.4;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
      ring1Ref.current.rotation.x += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.6;
      ring2Ref.current.rotation.z -= delta * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={[0, 0, 0]}>
        {/* Core Glowing Orb */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>

        {/* Gyroscopic Ring 1 (Emerald/Cyan) */}
        <group ref={ring1Ref} rotation={[0.6, 0.4, 0]}>
          <mesh>
            <torusGeometry args={[2.0, 0.04, 16, 80]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#10b981"
              emissiveIntensity={0.8}
              metalness={0.9}
            />
          </mesh>
        </group>

        {/* Gyroscopic Ring 2 (Solar Amber) */}
        <group ref={ring2Ref} rotation={[-0.5, 0.8, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.035, 16, 80]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              metalness={0.85}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
};

interface CosmicHomePageProps {
  aiStatus: AIStatus | null;
  onLaunchDashboard: () => void;
  onOpenScanModal: () => void;
}

export const CosmicHomePage: React.FC<CosmicHomePageProps> = ({
  aiStatus,
  onLaunchDashboard,
  onOpenScanModal,
}) => {
  const titleWords = ['SoapScan', 'AI'];

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto text-slate-100">
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-6 pt-2 sm:pt-6 max-w-4xl mx-auto">
        {/* 3D Interactive Orbital Planet Hero */}
        <div className="w-44 h-44 sm:w-52 sm:h-52 mx-auto relative cursor-grab active:cursor-grabbing">
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.8} color="#22d3ee" />
            <directionalLight position={[-5, -5, -3]} intensity={1.5} color="#f59e0b" />
            <HeroOrbitalPlanet />
          </Canvas>
          {/* Subtle underglow aura */}
          <div className="absolute inset-4 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none -z-10" />
        </div>

        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPhysics}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian-950/80 border border-teal-500/40 backdrop-blur shadow-lg shadow-teal-500/10"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-sonar-radar absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-teal-300 uppercase">
            {aiStatus?.online ? `Gemma 4 Local AI Online (Latency: ~12ms)` : 'Cosmic Telemetry System Active'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-amber-300 font-medium font-mono">Port 5173 / 3001</span>
        </motion.div>

        {/* Hero Title with Staggered Word Reveal & Shimmer */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 overflow-hidden">
            {titleWords.map((word, idx) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                  delay: idx * 0.12,
                }}
                className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent drop-shadow-sm ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-teal-300 animate-shimmer-text'
                    : 'bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-xl sm:text-2xl font-bold text-slate-200 tracking-wide"
          >
            3D Cosmic Telemetry &amp; Household Consumption Intelligence
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Real-time procedural 3D Digital Twins, dual-engine barcode scanner, and multimodal local Gemma 4 computer-vision AI tracking every gram and milliliter across your home.
          </motion.p>
        </div>

        {/* CTA Buttons with Spring Hover & Sheen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, ...springPhysics }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={onLaunchDashboard}
            className="relative overflow-hidden px-6 py-3.5 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-obsidian-950 font-black text-sm rounded-2xl shadow-xl shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
          >
            <div className="absolute inset-0 w-1/3 bg-white/40 blur-[2px] -skew-x-12 -translate-x-[200%] group-hover:translate-x-[450%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            <span className="relative z-10">Launch Command Center (Dashboard)</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenScanModal}
            className="px-6 py-3.5 bg-obsidian-900/90 hover:bg-obsidian-800 text-white font-bold text-sm rounded-2xl border border-teal-500/40 hover:border-teal-400 backdrop-blur shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer group"
          >
            <Camera className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
            <span>Scan Soap with 3D Hologram</span>
          </button>
        </motion.div>
      </div>

      {/* 2. INTERACTIVE 3D SHOWCASE DECK (3 STAGGERED TILT CARDS) */}
      <motion.div
        variants={staggerContainer(0.1, 0.2)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10"
      >
        {/* Showcase Card 1 */}
        <motion.div variants={staggerItem}>
          <TiltCard3D maxTilt={6} spotlightColor="16, 185, 129">
            <div className="p-6 rounded-3xl bg-obsidian-950/85 border border-teal-500/30 hover:border-teal-400 shadow-xl backdrop-blur-xl h-full flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:scale-105 transition-transform">
                  <Barcode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition">
                  Gemma 4 Vision &amp; Barcode Scanner
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scan Indian FMCG barcodes (Mysore Sandal, Dove, Dettol, Pears) or point your webcam hands-free. Local Gemma 4 instantly extracts brand, weight, price, and color specs in under 10ms.
                </p>
              </div>
              <div className="pt-3 border-t border-teal-900/40 flex items-center justify-between text-[11px] font-mono text-teal-300">
                <span>Dual-Engine Native Decoder</span>
                <span className="text-amber-400 font-bold">100% Offline AI</span>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* Showcase Card 2 */}
        <motion.div variants={staggerItem}>
          <TiltCard3D maxTilt={6} spotlightColor="245, 158, 11">
            <div className="p-6 rounded-3xl bg-obsidian-950/85 border border-amber-500/30 hover:border-amber-400 shadow-xl backdrop-blur-xl h-full flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition">
                  Real-Time 3D Digital Twin Depletion
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Watch soaps visually morph, bevel, and deplete in 3D WebGL space. Solid soap bars curve and wear down, while liquid soap pump dispensers physically lower their liquid column.
                </p>
              </div>
              <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-[11px] font-mono text-amber-300">
                <span>Three.js Shader Morphing</span>
                <span className="text-teal-400 font-bold">Tare Calibrated</span>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        {/* Showcase Card 3 */}
        <motion.div variants={staggerItem}>
          <TiltCard3D maxTilt={6} spotlightColor="6, 182, 212">
            <div className="p-6 rounded-3xl bg-obsidian-950/85 border border-cyan-500/30 hover:border-cyan-400 shadow-xl backdrop-blur-xl h-full flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                  Precision Scale &amp; Pump Telemetry
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect real kitchen or bathroom scales, or use 1-click micro-dosing buttons (-1.5 mL pumps or -4g washes). Server-Sent Events (SSE) broadcast updates instantly across all household devices.
                </p>
              </div>
              <div className="pt-3 border-t border-cyan-900/40 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span>SSE Real-Time Push</span>
                <span className="text-amber-400 font-bold">Zero-Reload Sync</span>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>
      </motion.div>

      {/* 3. LIVE HOUSEHOLD TELEMETRY TICKER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...springPhysics }}
        className="p-3.5 rounded-2xl bg-obsidian-950/90 border border-teal-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-inner"
      >
        <div className="flex items-center gap-2 text-teal-400 font-bold">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>COSMIC TELEMETRY STREAM</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <span>
            AI ENGINE: <strong className="text-white">soapscan-gemma4</strong>
          </span>
          <span>•</span>
          <span>
            SSE STREAM: <strong className="text-emerald-400">ACTIVE (10s Heartbeat)</strong>
          </span>
          <span>•</span>
          <span>
            BARCODE REGISTRY: <strong className="text-amber-400">FMCG Tier 1-3 Online</strong>
          </span>
        </div>
        <button
          onClick={onLaunchDashboard}
          className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
};

