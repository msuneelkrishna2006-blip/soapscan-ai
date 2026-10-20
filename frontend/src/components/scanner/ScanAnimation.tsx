import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScanAnimationProps {
  isScanning: boolean;
  isAnalyzing: boolean;
  isLocked: boolean;
  lockedLabel?: string;
  className?: string;
}

export const ScanAnimation: React.FC<ScanAnimationProps> = ({
  isScanning,
  isAnalyzing,
  isLocked,
  lockedLabel,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const primaryColor = isLocked ? 'rgba(16, 185, 129, 0.9)' : 'rgba(20, 184, 166, 0.85)';
  const beamColor = isLocked
    ? 'from-transparent via-emerald-400 to-transparent'
    : 'from-transparent via-cyan-400 to-transparent';

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-20 ${className}`}>
      {/* 4 Corner Targeting Brackets */}
      <div className="absolute inset-6 sm:inset-10 border-2 border-transparent pointer-events-none">
        {/* Top-Left */}
        <div
          className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${
            isLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'border-teal-400/80 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
          }`}
        />
        {/* Top-Right */}
        <div
          className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-300 ${
            isLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'border-teal-400/80 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
          }`}
        />
        {/* Bottom-Left */}
        <div
          className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-colors duration-300 ${
            isLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'border-teal-400/80 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
          }`}
        />
        {/* Bottom-Right */}
        <div
          className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${
            isLocked ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'border-teal-400/80 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
          }`}
        />
      </div>

      {/* Moving Horizontal Scanning Laser Beam */}
      {isScanning && !shouldReduceMotion && (
        <motion.div
          initial={{ top: '8%' }}
          animate={{ top: ['8%', '88%', '8%'] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-x-8 sm:inset-x-14 h-[2px] bg-gradient-to-r ${beamColor} shadow-[0_0_16px_rgba(45,212,191,0.9)]`}
        >
          {/* Subtle beam glow flare */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-teal-400/20 blur-sm rounded-full" />
        </motion.div>
      )}

      {/* Subtle Scanning Radar Pulse while analyzing */}
      {isAnalyzing && !shouldReduceMotion && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: [0.6, 1.3, 1.8], opacity: [0.8, 0.4, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-teal-400/60 pointer-events-none"
        />
      )}

      {/* Locked Target Confirmation Pulse */}
      {isLocked && !shouldReduceMotion && (
        <motion.div
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1.15, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-4 sm:inset-8 border-2 border-emerald-400 rounded-2xl pointer-events-none"
        />
      )}
    </div>
  );
};
