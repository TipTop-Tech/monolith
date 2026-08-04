import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { playStartupSound } from '../../utils/audio';
import { StaticNoiseBackground } from './ui/NoiseBackground';
import { motion, useAnimation, AnimatePresence } from 'motion/react';

export const StartOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const noiseControls = useAnimation();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      setShowOverlay(true);
      // Subtle background noise drift before start
      noiseControls.start({
        x: ["0%", "-2%", "0%"],
        y: ["0%", "2%", "0%"],
        transition: { duration: 15, ease: "linear", repeat: Infinity }
      });
    } else {
      // On mobile, just play the sound (if it's the first time)
      playStartupSound();
    }
  }, [noiseControls]);

  const handleStart = async () => {
    if (isWarping) return;
    setIsWarping(true);
    playStartupSound();

    // Mount the app in the background while the overlay fades out
    setHasStarted(true);

    // Warp speed transition for the noise
    await noiseControls.start({
      scale: 3,
      opacity: 0,
      filter: "blur(300%)",
      transition: { duration: 0.2, ease: "easeIn" }
    });

    setShowOverlay(false);
  };

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-auto"
            initial={{ backgroundColor: "rgba(0,0,0,1)" }}
            animate={{
              backgroundColor: isWarping ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)",
              transition: { duration: 1.2, ease: "easeIn" }
            }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <StaticNoiseBackground controls={noiseControls} />

            <motion.div
              className="relative w-[500px] h-[400px] mb-6 z-52"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isWarping ? { opacity: 0, scale: 1.5, filter: "blur(10px)" } : { opacity: 1, scale: 1 }}
              transition={{
                duration: isWarping ? 1.2 : 2.5,
                ease: isWarping ? "easeIn" : "easeOut"
              }}
            >
              <img
                src="/assets/Monolith_Logo.svg"
                alt="Monolith Logo"
                className="w-full h-full pointer-events-none"
              />

              <motion.button
                onClick={handleStart}
                className="absolute left-[50%] top-[175px] -translate-x-1/2 -translate-y-1/2 w-[41.5px] h-[41.5px] rounded-full bg-white cursor-pointer z-50 group border-none outline-none shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                animate={isWarping ? { opacity: 0, scale: 0 } : {
                  boxShadow: ["0 0 15px rgba(255,255,255,0.3)", "0 0 30px rgba(255,255,255,0.8)", "0 0 15px rgba(255,255,255,0.3)"],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: isWarping ? 0.5 : 2.5,
                  repeat: isWarping ? 0 : Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the actual app once started, or immediately on mobile platforms */}
      {(!showOverlay || hasStarted) && children}
    </>
  );
};
