import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FloatingLogoProps {
  className?: string;
}

/**
 * <FloatingLogo />
 * Premium floating KaizenQ logo with:
 * - Slow up/down float animation
 * - Soft pulsing radial glow aura (theme-aware via Tailwind dark: classes)
 * - 3 tiny orbiting accent dots
 * - Hover: logo scale + intensified glow
 * - prefers-reduced-motion: all animations disabled, static logo
 */
export const FloatingLogo: React.FC<FloatingLogoProps> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  // Orbiting accent dots config
  const orbitDots = [
    { color: '#2563EB', shadowColor: 'rgba(37,99,235,0.9)',   radius: 78,  speed: 9,  size: 5,   startAngle: 0   },
    { color: '#8B5CF6', shadowColor: 'rgba(139,92,246,0.9)', radius: 92,  speed: 13, size: 4,   startAngle: 120 },
    { color: '#EC4899', shadowColor: 'rgba(236,72,153,0.9)', radius: 70,  speed: 11, size: 3.5, startAngle: 240 },
  ];

  return (
    <div className={`relative flex items-center justify-center group ${className}`}>

      {/* ── Pulsing radial glow aura ─────────────────────────────────────── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 220, height: 220 }}
        animate={
          shouldReduceMotion
            ? {}
            : { scale: [1, 1.09, 1], opacity: [0.55, 0.78, 0.55] }
        }
        transition={
          shouldReduceMotion
            ? {}
            : { duration: 4.5, ease: 'easeInOut', repeat: Infinity }
        }
      >
        {/* Light mode glow — hidden in dark */}
        <div
          className="absolute inset-0 rounded-full dark:opacity-0 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(37,99,235,0.14) 35%, rgba(236,72,153,0.08) 65%, transparent 80%)',
            filter: 'blur(32px)',
          }}
        />
        {/* Dark mode glow — hidden in light */}
        <div
          className="absolute inset-0 rounded-full opacity-0 dark:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.48) 0%, rgba(37,99,235,0.32) 35%, rgba(236,72,153,0.18) 65%, transparent 80%)',
            filter: 'blur(36px)',
          }}
        />
      </motion.div>

      {/* ── Orbiting accent dots ───────────────────────────────────────────── */}
      {!shouldReduceMotion &&
        orbitDots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              backgroundColor: dot.color,
              boxShadow: `0 0 ${dot.size * 2.5}px ${dot.shadowColor}`,
            }}
            animate={{ rotate: [dot.startAngle, dot.startAngle + 360] }}
            transition={{ duration: dot.speed, ease: 'linear', repeat: Infinity }}
            transformTemplate={(_props, generated) => {
              // Override transform to orbit in an ellipse around center
              const match = generated.match(/rotate\(([^)]+)\)/);
              const deg = match ? parseFloat(match[1]) : 0;
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * dot.radius;
              const y = Math.sin(rad) * dot.radius * 0.35;
              return `translate(${x}px, ${y}px)`;
            }}
          />
        ))}

      {/* ── Floating logo ─────────────────────────────────────────────────── */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
        transition={
          shouldReduceMotion
            ? {}
            : { duration: 5.5, ease: 'easeInOut', repeat: Infinity }
        }
        whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
        className="relative z-10 cursor-default"
      >
        {/* Hover glow ring — appears on group hover */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            transform: 'scale(1.5)',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(37,99,235,0.18) 50%, transparent 75%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Logo — no card, no border, just the image with a drop-shadow */}
        <img
          src="/brand/kaizenq-logo.webp"
          alt="KaizenQ"
          draggable={false}
          className="w-36 h-36 sm:w-44 sm:h-44 object-contain select-none"
          style={{
            filter:
              'drop-shadow(0 6px 20px rgba(99,102,241,0.3)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))',
          }}
        />
      </motion.div>

      {/* ── "KAIZEN Q" label below ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 translate-y-12 text-center pointer-events-none select-none">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400 dark:text-slate-500 transition-colors duration-300">
          KAIZEN Q
        </span>
      </div>

    </div>
  );
};
