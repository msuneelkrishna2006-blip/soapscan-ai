import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, ArrowRight, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { FloatingSoap } from './FloatingSoap';
import { AIStatus } from '../../types/soap';

interface AnimatedHeroProps {
  aiStatus: AIStatus | null;
  onStartScanning: () => void;
  onExploreInsights: () => void;
  householdName?: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  aiStatus,
  onStartScanning,
  onExploreInsights,
  householdName,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Words for the animated tagline: "SCAN. TRACK. UNDERSTAND."
  const taglineWords = ['SCAN.', 'TRACK.', 'UNDERSTAND.'];

  return (
    <div className="relative w-full min-h-[calc(100vh-100px)] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Cinematic Typography & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Animated System Status Pill */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-obsidian-900/80 border border-teal-500/30 backdrop-blur-md shadow-lg shadow-teal-500/10 text-xs font-mono"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-teal-300 font-semibold tracking-wider uppercase">
              {aiStatus?.online ? 'Gemma 4 Local AI Online' : 'System Ready • Local AI Active'}
            </span>
            <span className="text-slate-600 dark:text-slate-500">|</span>
            <span className="text-amber-400 font-medium">100% Private &amp; Offline</span>
          </motion.div>

          {/* Large Animated Heading with Subtle Gradient Reveal */}
          <div className="space-y-3">
            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white"
            >
              The Intelligent Way <br />
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                to Track Your Soap.
              </span>
            </motion.h1>

            {/* Animated Tagline: SCAN. TRACK. UNDERSTAND. */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-teal-400/90 pt-1 uppercase"
            >
              {taglineWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={i === 2 ? 'text-amber-300 font-extrabold' : ''}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Subheading text */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-300 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Experience seamless computer-vision packaging recognition, real-time 3D Digital Twin morphing, and precision telemetry without manual data entry.
            </motion.p>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
          >
            {/* Primary CTA: "Start Scanning" */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.025, translateY: -1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={onStartScanning}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-obsidian-950 font-black text-sm rounded-2xl shadow-xl shadow-teal-500/25 transition flex items-center gap-2.5 group cursor-pointer border border-teal-300/40"
            >
              <Camera className="w-4 h-4 text-obsidian-950 transition group-hover:rotate-6" />
              <span>Start Scanning</span>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
            </motion.button>

            {/* Secondary CTA: "Explore Your Insights" */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.025, translateY: -1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={onExploreInsights}
              className="px-6 py-3.5 bg-obsidian-900/80 hover:bg-obsidian-800 text-white font-bold text-sm rounded-2xl border border-teal-500/30 hover:border-teal-400/60 backdrop-blur-md shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Your Insights</span>
            </motion.button>
          </motion.div>

          {/* Household Context Badge */}
          {householdName && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="pt-2 text-xs font-mono text-slate-400 flex items-center justify-center lg:justify-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Household: <strong className="text-white">{householdName}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-teal-400/90">Isolated Telemetry Node</span>
            </motion.div>
          )}
        </div>

        {/* Right Column: Realistic 3D Floating Soap Bar with Parallax */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative flex items-center justify-center"
        >
          {/* Subtle Backlight Radial Halo */}
          <div className="absolute inset-0 bg-radial-gradient from-teal-500/15 via-transparent to-transparent blur-2xl pointer-events-none" />

          {/* Floating 3D Soap Bar */}
          <div className="w-full h-80 sm:h-96 relative flex items-center justify-center">
            <FloatingSoap colorHex="#14b8a6" enableParallax={!shouldReduceMotion} />
          </div>

          {/* Interactive Floating Pill Feature Callout */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-2 right-4 sm:right-8 px-3 py-1.5 rounded-xl bg-obsidian-950/90 border border-teal-500/40 backdrop-blur-md shadow-xl text-[11px] font-mono text-teal-300 flex items-center gap-2 pointer-events-none"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>360° Procedural Twin Depletion</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
