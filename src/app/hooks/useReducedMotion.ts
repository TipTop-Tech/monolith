import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  const os =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(QUERY).matches
      : false;
  try {
    return os || localStorage.getItem("reduceMotion") === "true";
  } catch {
    return os;
  }
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const update = () => setReduced(prefersReducedMotion());
    const mq =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia(QUERY)
        : null;
    mq?.addEventListener("change", update);
    window.addEventListener("prefschange", update);
    return () => {
      mq?.removeEventListener("change", update);
      window.removeEventListener("prefschange", update);
    };
  }, []);

  return reduced;
}
