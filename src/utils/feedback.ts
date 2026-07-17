import { haptics } from "../app/lib/haptics";
import { prefersReducedMotion } from "../app/hooks/useReducedMotion";

type FxType = "success" | "thud";

const KEYFRAMES: Record<FxType, Keyframe[]> = {
  success: [
    { transform: "scale(1)" },
    { transform: "scale(1.06)", offset: 0.4 },
    { transform: "scale(1)" },
  ],
  thud: [
    { transform: "scale(1)" },
    { transform: "scale(1.08)", offset: 0.25 },
    { transform: "scale(0.98)", offset: 0.55 },
    { transform: "scale(1)" },
  ],
};

const TIMING: Record<FxType, KeyframeAnimationOptions> = {
  success: { duration: 320, easing: "ease-out" },
  thud: { duration: 400, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
};

export function pulse(el: HTMLElement | null | undefined, type: FxType): void {
  if (!el || prefersReducedMotion() || typeof el.animate !== "function") return;
  el.animate(KEYFRAMES[type], TIMING[type]);
}

export const feedback = {
  success: (el?: HTMLElement | null) => {
    haptics.success();
    pulse(el, "success");
  },
  thud: (el?: HTMLElement | null) => {
    haptics.thud();
    pulse(el, "thud");
  },
};
