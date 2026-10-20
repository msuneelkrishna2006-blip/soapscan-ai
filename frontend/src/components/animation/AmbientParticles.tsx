import React, { useEffect, useRef } from 'react';

interface AmbientParticlesProps {
  particleCount?: number;
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  particleCount = 50,
  density = 'medium',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectiveCount = density === 'low' ? 20 : density === 'high' ? 70 : particleCount;

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Responsive count: fewer particles on smaller screens
    const baseCount = density === 'low' ? 20 : density === 'high' ? 70 : particleCount;
    const effectiveCount = width < 768 ? Math.floor(baseCount * 0.45) : baseCount;

    const colors = [
      'rgba(20, 184, 166,',  // Radiant Teal #14B8A6
      'rgba(45, 212, 191,',  // Bright Cyan #2DD4BF
      'rgba(13, 148, 136,',  // Deep Teal #0D9488
      'rgba(212, 175, 55,',   // Subtle Metallic Gold #D4AF37
    ];

    const particles: Particle[] = Array.from({ length: effectiveCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      baseAlpha: Math.random() * 0.4 + 0.15,
      alpha: 0.2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35 - 0.1, // subtle upward drift
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulsePhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx * delta * 60;
        p.y += p.vy * delta * 60;
        p.pulsePhase += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.12;

        // Wrap edges seamlessly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Render soft glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${Math.max(0.05, Math.min(1, p.alpha))})`;
        ctx.shadowColor = 'rgba(20, 184, 166, 0.45)';
        ctx.shadowBlur = p.size * 3.5;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};
