import React from 'react';
import { motion } from 'framer-motion';

interface FloatingSoapHoloProps {
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  glowColor?: string;
}

export const FloatingSoapHolo: React.FC<FloatingSoapHoloProps> = ({
  icon = '🧼',
  size = 'md',
  glowColor = '#10B981',
}) => {
  const iconSizeClass =
    size === 'lg' ? 'text-4xl w-20 h-20' : size === 'sm' ? 'text-2xl w-12 h-12' : 'text-3xl w-16 h-16';

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      {/* Gentle sine wave floating soap icon */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
        className={`relative z-10 flex items-center justify-center rounded-2xl bg-gradient-to-b from-radiant-teal/20 to-obsidian-900 border border-teal-500/40 shadow-xl backdrop-blur-md ${iconSizeClass}`}
        style={{
          boxShadow: `0 0 24px -4px ${glowColor}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}
      >
        <span className="select-none filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]">
          {icon}
        </span>
      </motion.div>

      {/* Orbiting Holographic Scan Ring beneath the soap */}
      <div className="relative -mt-3 w-28 h-8 flex items-center justify-center pointer-events-none">
        {/* Outer glowing elliptical ring */}
        <motion.div
          animate={{
            rotateX: [68, 68, 68],
            rotateZ: [0, 360],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            rotateZ: { repeat: Infinity, duration: 6, ease: 'linear' },
            scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
          }}
          className="absolute w-24 h-12 rounded-full border border-dashed border-emerald-400/60"
          style={{
            transformStyle: 'preserve-3d',
            perspective: '500px',
            boxShadow: `0 0 15px ${glowColor}40`,
          }}
        />

        {/* Inner solid rotating scan ellipse */}
        <motion.div
          animate={{
            rotateX: [68, 68, 68],
            rotateZ: [360, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'linear',
          }}
          className="absolute w-16 h-8 rounded-full border border-teal-400/80"
          style={{
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Ambient focal spotlight */}
        <div
          className="absolute w-20 h-6 rounded-full blur-md opacity-40"
          style={{ backgroundColor: glowColor }}
        />
      </div>
    </div>
  );
};
