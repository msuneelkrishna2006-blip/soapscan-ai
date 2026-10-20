import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedMetricProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  className?: string;
}

export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  value,
  duration = 0.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  unit = '',
  className = '',
}) => {
  const effectiveSuffix = suffix || unit;
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startVal = prevValueRef.current;
    const endVal = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let animId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, [value, duration, shouldReduceMotion]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`font-mono tracking-tight font-black ${className}`}>
      {prefix}
      {formatted}
      {effectiveSuffix}
    </span>
  );
};
