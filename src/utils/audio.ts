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

let isSwipePreloaded = false;
const SWIPE_POOL_SIZE = 4;
let currentSwipeLeftIndex = 0;
let currentSwipeRightIndex = 0;

export const preloadSwipeSounds = async () => {
  try {
    const promises = [];
    for (let i = 0; i < SWIPE_POOL_SIZE; i++) {
      promises.push(
        NativeAudio.preload({
          assetId: `swipe_left_${i}`,
          assetPath: Capacitor.getPlatform() === 'web' ? '/assets/deepClink.mp3' : 'public/assets/deepClink.mp3',
          isComplex: true,
          isUrl: Capacitor.getPlatform() === 'web',
        })
      );
      promises.push(
        NativeAudio.preload({
          assetId: `swipe_right_${i}`,
          assetPath: Capacitor.getPlatform() === 'web' ? '/assets/deepClink.mp3' : 'public/assets/deepClink.mp3',
          isComplex: true,
          isUrl: Capacitor.getPlatform() === 'web',
        })
      );
    }
    await Promise.all(promises);
    isSwipePreloaded = true;
  } catch (error) {
    console.error('Failed to preload swipe sounds:', error);
  }
};

export const playSwipeLeftSound = async () => {
  if (!isSoundEnabled()) return;
  try {
    if (!isSwipePreloaded) {
      await preloadSwipeSounds();
    }
    await NativeAudio.play({
      assetId: `swipe_left_${currentSwipeLeftIndex}`,
    });
    currentSwipeLeftIndex = (currentSwipeLeftIndex + 1) % SWIPE_POOL_SIZE;
  } catch (error) {
    console.error('Error playing swipe left sound:', error);
  }
};

export const playSwipeRightSound = async () => {
  if (!isSoundEnabled()) return;
  try {
    if (!isSwipePreloaded) {
      await preloadSwipeSounds();
    }
    await NativeAudio.play({
      assetId: `swipe_right_${currentSwipeRightIndex}`,
    });
    currentSwipeRightIndex = (currentSwipeRightIndex + 1) % SWIPE_POOL_SIZE;
  } catch (error) {
    console.error('Error playing swipe right sound:', error);
  }
};

let isHistorySoundPreloaded = false;

export const preloadHistorySound = async () => {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      await NativeAudio.configure({ focus: false });
    }

    await NativeAudio.preload({
      assetId: 'history',
      assetPath: Capacitor.getPlatform() === 'web' ? '/assets/deep_synth_ping.mp3' : 'public/assets/deep_synth_ping.mp3',
      isComplex: false,
      isUrl: Capacitor.getPlatform() === 'web',
    });
    isHistorySoundPreloaded = true;
  } catch (error) {
    console.error('Failed to preload history sound:', error);
  }
};

export const playHistorySound = async () => {
  if (!isSoundEnabled()) return;

  try {
    if (!isHistorySoundPreloaded) {
      await preloadHistorySound();
    }
    await NativeAudio.play({
      assetId: 'history',
    });
  } catch (error) {
    console.error('Error playing history sound:', error);
  }
};

let isBodyMapSoundPreloaded = false;

export const preloadBodyMapSound = async () => {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      await NativeAudio.configure({ focus: false });
    }

    await NativeAudio.preload({
      assetId: 'bodymap',
      assetPath: Capacitor.getPlatform() === 'web' ? '/assets/gong_2.mp3' : 'public/assets/gong_2.mp3',
      isComplex: false,
      isUrl: Capacitor.getPlatform() === 'web',
    });
    isBodyMapSoundPreloaded = true;
  } catch (error) {
    console.error('Failed to preload body map sound:', error);
  }
};

export const playBodyMapSound = async () => {
  if (!isSoundEnabled()) return;

  try {
    if (!isBodyMapSoundPreloaded) {
      await preloadBodyMapSound();
    }
    await NativeAudio.play({
      assetId: 'bodymap',
    });
  } catch (error) {
    console.error('Error playing body map sound:', error);
  }
};
