import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

interface WordConfig {
  text: string;
  type: 'solid' | 'gradient-build' | 'gradient-evolve';
}

const words: WordConfig[] = [
  { text: 'Learn.', type: 'solid' },
  { text: 'Build.', type: 'gradient-build' },
  { text: 'Evolve.', type: 'gradient-evolve' },
];

export const AnimatedHeroText: React.FC<{ className?: string }> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  // Container variants with staggered word reveals
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  // Word variants
  const wordVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.035,
      },
    },
  };

  // Individual letter variants for typewriter / split-text entrance
  const letterVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 14,
      scale: shouldReduceMotion ? 1 : 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.h1
      className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] flex flex-wrap gap-x-3 gap-y-1 justify-center lg:justify-start ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => {
        // Styling based on word type
        let styleObj: React.CSSProperties = {};
        let textClasses = '';

        if (word.type === 'solid') {
          textClasses = 'text-[#0f172a] dark:text-[#ffffff]';
        } else if (word.type === 'gradient-build') {
          textClasses = 'text-transparent bg-clip-text animate-gradient-shimmer';
          styleObj = {
            backgroundImage:
              'linear-gradient(90deg, #2563EB 0%, #6366F1 35%, #8B5CF6 70%, #2563EB 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          };
        } else if (word.type === 'gradient-evolve') {
          textClasses = 'text-transparent bg-clip-text animate-gradient-shimmer';
          styleObj = {
            backgroundImage:
              'linear-gradient(90deg, #2563EB 0%, #6366F1 25%, #8B5CF6 45%, #EC4899 70%, #F97316 90%, #2563EB 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          };
        }

        return (
          <motion.span
            key={wordIndex}
            className={`inline-flex whitespace-nowrap ${textClasses}`}
            variants={wordVariants}
            style={styleObj}
          >
            {word.text.split('').map((char, charIndex) => (
              <motion.span
                key={`${wordIndex}-${charIndex}`}
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        );
      })}
    </motion.h1>
  );
};
