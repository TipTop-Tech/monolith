import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

let hasPlayedStartupSound = false;
let isPreloaded = false;

export const isSoundEnabled = (): boolean => {
  try {
    return localStorage.getItem("soundEnabled") !== "false";
  } catch {
    return true;
  }
};

export const preloadStartupSound = async () => {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      await NativeAudio.configure({ focus: false });
    }

    await NativeAudio.preload({
      assetId: 'startup',
      assetPath: Capacitor.getPlatform() === 'web' ? '/assets/startup4.mp3' : 'public/assets/startup4.mp3',
      isComplex: false,
      isUrl: Capacitor.getPlatform() === 'web',
    });
    isPreloaded = true;
  } catch (error) {
    console.error('Failed to preload startup sound:', error);
  }
};

let isClinkPreloaded = false;
const CLINK_POOL_SIZE = 8;
let currentClinkIndex = 0;

export const preloadClinkSound = async () => {
  try {
    const promises = [];
    for (let i = 0; i < CLINK_POOL_SIZE; i++) {
      promises.push(
        NativeAudio.preload({
          assetId: `clink_${i}`,
          assetPath: Capacitor.getPlatform() === 'web' ? '/assets/clink2.mp3' : 'public/assets/clink2.mp3',
          isComplex: true,
          volume: 0.5,
          isUrl: Capacitor.getPlatform() === 'web',
        })
      );
    }
    await Promise.all(promises);
    isClinkPreloaded = true;
  } catch (error) {
    console.error('Failed to preload clink sound pool:', error);
  }
};

export const playClinkSound = async () => {
  if (!isSoundEnabled()) return;
  try {
    if (!isClinkPreloaded) {
      await preloadClinkSound();
    }
    await NativeAudio.play({
      assetId: `clink_${currentClinkIndex}`,
    });
    currentClinkIndex = (currentClinkIndex + 1) % CLINK_POOL_SIZE;
  } catch (error) {
    console.error('Error playing clink sound:', error);
  }
};

export const playStartupSound = async () => {
  if (hasPlayedStartupSound || !isSoundEnabled()) {
    return;
  }

  try {
    if (!isPreloaded) {
      await preloadStartupSound();
    }
    await NativeAudio.play({
      assetId: 'startup',
    });
    // Only set to true if playback succeeded without error
    hasPlayedStartupSound = true;
  } catch (error) {
    console.error('Error playing startup sound:', error);
    // Leave hasPlayedStartupSound as false so subsequent user interaction can retry
  }
};
