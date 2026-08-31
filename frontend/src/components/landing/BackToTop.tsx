import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          title="Back to Top"
          aria-label="Back to Top"
          className="
            fixed bottom-6 right-6 z-40
            w-11 h-11 rounded-full flex items-center justify-center
            bg-[#2563EB] hover:bg-[#1d4ed8] text-white
            shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
            transition-all duration-150 cursor-pointer
            border border-white/10
          "
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
