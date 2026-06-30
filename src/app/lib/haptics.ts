import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * This is the entry point for haptic feedback
 * Every haptic in the app MUST go through here. IMPORTANT
 * This is safe to call from anywhere:
 *  - Web haptics are unreliable, must test in an app build
 *  - Respects the user's "hapticsEnabled" setting, which is on by default
 */

function enabled(): boolean {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    return localStorage.getItem("hapticsEnabled") !== "false";
  } catch {
    return true;
  }
}

function fire(run: () => Promise<unknown>): void {
  if (!enabled()) return;
  try {
    void run().catch(() => {});
  } catch {
    /* feedback must never break a user action */
  }
}

export const haptics = {
  /** Light tap - incidental button presses. */
  tap: () => fire(() => Haptics.impact({ style: ImpactStyle.Light })),
  /** Heavy thud - a strong single cue, such as when a timer hits zero */
  thud: () => fire(() => Haptics.impact({ style: ImpactStyle.Heavy })),
  /** Warm up the selection generator before a run of select() ticks. REQUIRED on iOS */
  selectStart: () => fire(() => Haptics.selectionStart()),
  /** Selection tick - one per detent while scrubbing a picker/wheel. Call selectStart() first. */
  select: () => fire(() => Haptics.selectionChanged()),
  /** Release the selection generator when the run ends. */
  selectEnd: () => fire(() => Haptics.selectionEnd()),
  /** Success - e.g. a set logged. */
  success: () => fire(() => Haptics.notification({ type: NotificationType.Success })),
  /** Warning - destructive actions (delete/remove). */
  warn: () => fire(() => Haptics.notification({ type: NotificationType.Warning })),
};
