import { useEffect, useState } from "react";
import { ThemePref, applyTheme, getThemePref, resolveTheme } from "../lib/theme";

export function useTheme() {
  const [pref, setPrefState] = useState<ThemePref>(getThemePref);

  useEffect(() => {
    const onChange = () => setPrefState(getThemePref());
    window.addEventListener("themechange", onChange);

    const mq =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    const onMedia = () => {
      if (getThemePref() === "auto") applyTheme("auto");
    };
    mq?.addEventListener("change", onMedia);

    return () => {
      window.removeEventListener("themechange", onChange);
      mq?.removeEventListener("change", onMedia);
    };
  }, []);

  const setPref = (next: ThemePref) => {
    applyTheme(next);
    setPrefState(next);
  };

  return { pref, setPref, resolved: resolveTheme(pref) };
}
