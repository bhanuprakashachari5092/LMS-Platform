import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';

interface WordItem {
  text: string;
  gradientStyle: React.CSSProperties;
}

const words: WordItem[] = [
  {
    text: 'Learn.',
    gradientStyle: {
      backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 55%, #06B6D4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  {
    text: 'Build.',
    gradientStyle: {
      backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #6366F1 50%, #8B5CF6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  {
    text: 'Evolve.',
    gradientStyle: {
      backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #6366F1 30%, #EC4899 70%, #F97316 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
];

export const RotatingSplitText: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const currentWord = words[index];

  // Container variants
  const wordContainerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.035,
        delayChildren: 0.04,
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

  // Letter variants (Enter from bottom, Exit to top)
  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
            type: 'spring',
            damping: 14,
            stiffness: 220,
          },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -24,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <h1
      className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] min-h-[1.2em] flex items-center justify-center lg:justify-start ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord.text}
          className="inline-flex whitespace-nowrap text-transparent bg-clip-text animate-gradient-shimmer select-none"
          style={currentWord.gradientStyle}
          variants={wordContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {currentWord.text.split('').map((char, charIdx) => (
            <motion.span
              key={`${currentWord.text}-${charIdx}`}
              variants={letterVariants}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
};
