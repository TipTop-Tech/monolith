import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeometricLinesProps {
  triggerKey: number;
  onComplete: () => void;
}

export function GeometricLines({ triggerKey, onComplete }: GeometricLinesProps) {
  const [lines, setLines] = useState<any[]>([]);
  const ANIMATION_DURATION = 1; // Adjust this to change the overall speed
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (triggerKey > 0) {
      const MAX_DELAY = 0.3;

      // Generate a burst of fine, varying length lines
      const newLines = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // Random horizontal position
        height: Math.random() * 80 + 40, // Height between 40px and 120px
        delay: Math.random() * MAX_DELAY, // Staggered start times
        opacity: Math.random() * 0.4 + 0.4, // Semi-transparent
        width: Math.random() > 0.9 ? 2 : 1, // Mostly fine lines, a few slightly thicker
      }));
      setLines(newLines);

      const timer = setTimeout(() => {
        onCompleteRef.current();
        setLines([]);
      }, (ANIMATION_DURATION + MAX_DELAY) * 1000 + 100); // Wait for the animation to fully complete

      return () => clearTimeout(timer);
    }
  }, [triggerKey]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
      <AnimatePresence>
        {triggerKey > 0 && lines.map((line) => (
          <motion.div
            key={`${triggerKey}-${line.id}`}
            initial={{
              y: '100vh',
              opacity: 0
            }}
            animate={{
              y: '-20vh',
              opacity: [0, line.opacity, line.opacity, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              y: {
                duration: ANIMATION_DURATION,
                delay: line.delay,
                ease: [0.25, 0.1, 0.25, 1], // Smooth deliberate glide
              },
              opacity: {
                duration: ANIMATION_DURATION,
                delay: line.delay,
                ease: "linear",
                times: [0, 0.1, 0.8, 1], // Fade in quickly, hold, fade out smoothly
              }
            }}
            className="absolute top-0 bg-primary rounded-full"
            style={{
              left: `${line.left}%`,
              width: `${line.width}px`,
              height: `${line.height}px`,
              boxShadow: '0 0 8px var(--primary-glow)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
