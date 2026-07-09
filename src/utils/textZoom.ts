import { Capacitor } from "@capacitor/core";
import { TextZoom } from "@capacitor/text-zoom";

export async function applyPreferredTextZoom(): Promise<void> {
  if (Capacitor.getPlatform() === "web") return;
  try {
    const { value } = await TextZoom.getPreferred();
    await TextZoom.set({ value });
  } catch {
    void 0;
  }
}
