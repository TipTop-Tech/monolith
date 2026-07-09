export interface Skin {
  id: string;
  name: string;
  pro?: boolean;
  swatch: { bg: string; fg: string; accent: string };
}

export const SKINS: Skin[] = [
  { id: "light", name: "Light", swatch: { bg: "#ece9e4", fg: "#201d1a", accent: "#201d1a" } },
  { id: "dark", name: "Dark", swatch: { bg: "#0f0f0f", fg: "#e8e8e8", accent: "#e8e8e8" } },
  { id: "oled", name: "OLED", swatch: { bg: "#000000", fg: "#e8e8e8", accent: "#6b6b6b" } },
  { id: "ember", name: "Ember", swatch: { bg: "#14100e", fg: "#f0e6da", accent: "#e8863c" } },
];

export const SKIN_IDS = SKINS.map((s) => s.id);
