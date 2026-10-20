import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedFeatureCardProps {
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'teal' | 'gold' | 'cyan';
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  index?: number;
  className?: string;
  onClick?: () => void;
}

export const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  icon,
  badge,
  badgeColor = 'teal',
  title,
  description,
  metric,
  metricLabel,
  index = 0,
  className = '',
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'gold':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.65,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: -5,
              transition: { duration: 0.25, ease: 'easeOut' },
            }
      }
      onClick={onClick}
      className={`group relative p-6 sm:p-7 rounded-3xl bg-obsidian-950/85 border border-white/10 hover:border-teal-400/50 backdrop-blur-xl shadow-xl shadow-black/40 transition-colors duration-300 flex flex-col justify-between overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle Restrained Ambient Hover Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-teal-500/10 group-hover:bg-teal-500/20 blur-2xl transition-all duration-500 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        {/* Header: Icon + Optional Badge */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 group-hover:scale-105 group-hover:border-teal-400 transition-all duration-300">
            {icon}
          </div>

          {badge && (
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-teal-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 leading-relaxed font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Footer Metric or Visual Indicator */}
      {(metric || metricLabel) && (
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono relative z-10">
          <span className="text-slate-400">{metricLabel}</span>
          <span className="text-amber-400 font-bold font-mono">{metric}</span>
        </div>
      )}
    </motion.div>
  );
};
