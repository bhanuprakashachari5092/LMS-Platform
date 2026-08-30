import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

export interface RotatingSplitTextProps {
  words?: string[];
  interval?: number;
  className?: string;
  showUnderline?: boolean;
}

const DEFAULT_WORDS = ['Learn.', 'Build.', 'Evolve.'];

export const RotatingSplitText: React.FC<RotatingSplitTextProps> = ({
  words = DEFAULT_WORDS,
  interval = 2000,
  className = '',
  showUnderline = true,
}) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  const currentWord = words[index] || words[0] || 'Learn.';

  // Word container variants with 30ms letter stagger
  const wordContainerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.03,
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

  // Letter variants (translateY 16px -> 0 on enter, 0 -> -16px on exit)
  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16,
      transition: {
        duration: 0.25,
        ease: [0.7, 0, 0.84, 0],
      },
    },
  };

  return (
    <div className={`flex flex-col items-center lg:items-start select-none ${className}`}>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] min-h-[1.25em] flex items-center justify-center lg:justify-start">
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
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </h1>

      {/* Thin animated accent underline bar that smoothly tracks the active word */}
      {showUnderline && (
        <div className="mt-2.5 h-[3px] w-full max-w-[200px] flex items-center justify-center lg:justify-start overflow-hidden">
          <motion.div
            key={`bar-${currentWord}`}
            layoutId="heroAccentBar"
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#F97316]"
            initial={{ width: '40%', opacity: 0.7 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>
      )}
    </div>
  );
};
