import { SKIN_IDS } from "./skins";

export type ThemePref = string;
export type ResolvedTheme = string;

const KEY = "theme";
const DEFAULT_PREF: ThemePref = "auto";

export function getThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v && (v === "auto" || SKIN_IDS.includes(v))) return v;
  } catch {
    void 0;
  }
  return DEFAULT_PREF;
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref === "auto") {
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : true;
    return prefersDark ? "dark" : "light";
  }
  return pref;
}

export function applyTheme(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    void 0;
  }
  document.documentElement.dataset.theme = resolveTheme(pref);
  window.dispatchEvent(new Event("themechange"));
}
