import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

export interface RotatingSplitTextProps {
  words?: string[];
  interval?: number;
  className?: string;
  showUnderline?: boolean;
}

const DEFAULT_WORDS = ['Learn.', 'Build.', 'Evolve.'];

// Brand gradient palette for sparkle particles
const SPARKLE_COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#F97316'];

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

/** Single sparkle dot that animates outward then fades */
const Sparkle: React.FC<{ particle: SparkleParticle; isExit: boolean }> = ({
  particle,
  isExit,
}) => {
  const tx = Math.cos(particle.angle) * particle.distance;
  const ty = Math.sin(particle.angle) * particle.distance;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2.5}px ${particle.color}`,
        left: particle.x,
        top: particle.y,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: isExit ? 1 : 0, scale: isExit ? 0 : 1.4, x: 0, y: 0 }}
      animate={
        isExit
          ? { opacity: 0, scale: 1, x: tx, y: ty }
          : { opacity: 0, scale: 0, x: tx, y: ty }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    />
  );
};

/** Generates 2-3 sparkle particles for a letter at a given position */
function generateSparkles(
  charIdx: number,
  letterWidth: number,
  containerHeight: number,
  isExit: boolean,
): SparkleParticle[] {
  const count = Math.random() < 0.5 ? 2 : 3;
  const particles: SparkleParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = isExit
      ? (Math.PI / count) * i - Math.PI / 2 + (Math.random() - 0.5) * 1.2 // upward scatter on exit
      : Math.PI / 2 + (Math.PI / count) * i + (Math.random() - 0.5) * 1.2; // downward convergence on enter

    particles.push({
      id: `${charIdx}-${i}-${Date.now()}`,
      x: charIdx * letterWidth + letterWidth * 0.5,
      y: containerHeight * (0.35 + Math.random() * 0.3),
      color: SPARKLE_COLORS[(charIdx + i) % SPARKLE_COLORS.length],
      angle,
      distance: 10 + Math.random() * 14,
      size: 3 + Math.random() * 2,
    });
  }

  return particles;
}

export const RotatingSplitText: React.FC<RotatingSplitTextProps> = ({
  words = DEFAULT_WORDS,
  interval = 2200,
  className = '',
  showUnderline = true,
}) => {
  const [index, setIndex] = useState(0);
  const [exitSparkles, setExitSparkles] = useState<SparkleParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      // Trigger sparkle exit burst before switching word
      if (!shouldReduceMotion && containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const word = words[index] || '';
        const letterW = cw / Math.max(word.length, 1);
        const sparkles = word
          .split('')
          .flatMap((_, ci) => generateSparkles(ci, letterW, ch, true));
        setExitSparkles(sparkles);
        setTimeout(() => setExitSparkles([]), 600);
      }
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, index, shouldReduceMotion]);

  const currentWord = words[index] || words[0] || 'Learn.';

  /* ─── Variants ─── */
  const wordContainerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.032,
        delayChildren: 0.02,
      },
    },
    exit: {
      opacity: shouldReduceMotion ? 0 : 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.025,
        staggerDirection: 1,
      },
    },
  };

  const letterEnter: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      scale: shouldReduceMotion ? 1 : 0.82,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16,
      scale: shouldReduceMotion ? 1 : 0.88,
      transition: {
        duration: 0.22,
        ease: [0.7, 0, 0.84, 0],
      },
    },
  };

  return (
    <div className={`flex flex-col items-center lg:items-start select-none ${className}`}>
      {/* Heading wrapper — relative so sparkle particles position correctly */}
      <div
        ref={containerRef}
        className="relative min-h-[1.25em] flex items-center justify-center lg:justify-start"
      >
        {/* Sparkle particles layer (exit burst) */}
        {!shouldReduceMotion && exitSparkles.map((p) => (
          <Sparkle key={p.id} particle={p} isExit={true} />
        ))}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWord}
              className="inline-flex whitespace-nowrap text-transparent bg-clip-text animate-gradient-shimmer"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #2563EB 0%, #6366F1 30%, #EC4899 65%, #F97316 85%, #2563EB 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              variants={wordContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentWord.split('').map((char, charIdx) => (
                <motion.span
                  key={`${currentWord}-${charIdx}`}
                  variants={letterEnter}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </h1>
      </div>

      {/* Thin gradient accent underline bar */}
      {showUnderline && (
        <div className="mt-2.5 h-[3px] w-full max-w-[200px] overflow-hidden rounded-full">
          <motion.div
            key={`bar-${currentWord}`}
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#F97316]"
            initial={{ scaleX: 0.3, opacity: 0.6, transformOrigin: 'left' }}
            animate={{ scaleX: 1, opacity: 1, transformOrigin: 'left' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </div>
  );
};
