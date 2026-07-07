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
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8 text-primary">Welcome</h1>
        <p className="text-muted-foreground mb-8 text-center px-4 max-w-sm">
          Click start to enter the application.
        </p>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg active:scale-95"
        >
          Start
        </button>
      </div>
    );
  }

  // Render the actual app once started, or immediately on mobile platforms
  return <>{children}</>;
};
