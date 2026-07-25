import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { playStartupSound } from '../../utils/audio';
import { Button } from '@/components/ui/button';

export const StartOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only show the overlay on the web platform, where autoplay is blocked without user interaction.
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      setShowOverlay(true);
    } else {
      // On mobile, just play the sound (if it's the first time)
      playStartupSound();
    }
  }, []);

  const handleStart = async () => {
    // Play the startup sound and transition into the app
    await playStartupSound();
    setHasStarted(true);
    setShowOverlay(false);
  };

  if (showOverlay && !hasStarted) {
    return (
      <div className="fixed inset-0 z-[10000] bg-#171414 flex flex-col items-center justify-center">

        <h1
          className="display-font text-[80px] bevel-text-large mb-2"
        >
          Welcome
        </h1>

        <div className="relative w-[500px] h-[400px] mb-6 z-52">
          <img
            src="/assets/Monolith Logo.svg"
            alt="Monolith Logo"
            className="w-full h-full"
          />

          <button
            onClick={handleStart}
            className="absolute left-[50%] top-[175px] -translate-x-1/2 -translate-y-1/2 w-[41.5px] h-[41.5px] rounded-full bg-white cursor-pointer z-50 group border-none outline-none shadow-lg"
          >
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>
      </div>
    );
  }

  // Render the actual app once started, or immediately on mobile platforms
  return <>{children}</>;
};
