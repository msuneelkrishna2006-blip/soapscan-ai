import { Variants, Transition } from 'framer-motion';

// Production-grade Spring Physics matching Linear / Raycast / Apple visionOS
export const springPhysics: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  mass: 0.8,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
};

export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 28,
};

// View Page Transition Variants (0.28s blur & y-offset)
export const pageViewVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(6px)',
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Staggered Container Variants
export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0.05): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPhysics,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

export const tableRowSlide: Variants = {
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 26,
    },
  },
};

// Modal Scale & Backdrop
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalCardVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: springPhysics },
  exit: { opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)', transition: { duration: 0.2 } },
};
