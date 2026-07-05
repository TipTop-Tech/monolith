import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

let hasPlayedStartupSound = false;
let isPreloaded = false;

export const preloadStartupSound = async () => {
  if (Capacitor.getPlatform() !== 'web') {
    try {
      await NativeAudio.preload({
        assetId: 'startup',
        // In Capacitor, files in the public folder are placed at the root of the app's web assets.
        // So public/assets/startup2.mp3 becomes assets/startup2.mp3
        assetPath: 'assets/startup2.mp3',
        isComplex: false,
      });
      isPreloaded = true;
    } catch (error) {
      console.error('Failed to preload startup sound:', error);
    }
  }
};

export const playStartupSound = async () => {
  if (hasPlayedStartupSound) {
    return;
  }

  try {
    if (Capacitor.getPlatform() !== 'web') {
      if (!isPreloaded) {
        await NativeAudio.preload({
          assetId: 'startup',
          assetPath: 'assets/startup4 .mp3',
          isComplex: false,
        });
      }
      await NativeAudio.play({
        assetId: 'startup',
      });
    } else {
      const audio = new Audio('/assets/startup4.mp3');
      await audio.play();
    }
    // Only set to true if playback succeeded without error
    hasPlayedStartupSound = true;
  } catch (error) {
    console.error('Error playing startup sound:', error);
    // Leave hasPlayedStartupSound as false so subsequent user interaction can retry
  }
};
