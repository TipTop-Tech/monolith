const UNIT_KEY = "weightUnit";
const REST_KEY = "defaultRestTime";

export function getWeightUnit(): string {
  try {
    return localStorage.getItem(UNIT_KEY) || "LB";
  } catch {
    return "LB";
  }
}

export function setWeightUnitPref(unit: string): void {
  try {
    localStorage.setItem(UNIT_KEY, unit);
  } catch {
    void 0;
  }
}

export function getDefaultRestTime(): number {
  try {
    const v = Number(localStorage.getItem(REST_KEY));
    return v > 0 ? v : 90;
  } catch {
    return 90;
  }
}

export function setDefaultRestTime(seconds: number): void {
  try {
    localStorage.setItem(REST_KEY, String(seconds));
  } catch {
    void 0;
  }
}
