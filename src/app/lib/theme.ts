export type ThemePref = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

const KEY = "theme";
const DEFAULT_PREF: ThemePref = "auto";

export function getThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
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
