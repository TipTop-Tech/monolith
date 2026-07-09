import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function read(): boolean {
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

// True when the user prefers reduced motion (OS setting OR the in-app override).
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(read);

  useEffect(() => {
    const update = () => setReduced(read());
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
