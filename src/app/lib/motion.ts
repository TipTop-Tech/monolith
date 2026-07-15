// Spring presets; gate on useReducedMotion() to fall back to INSTANT.
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_SOFT = { type: "spring" as const, stiffness: 220, damping: 28 };
export const INSTANT = { duration: 0 } as const;
