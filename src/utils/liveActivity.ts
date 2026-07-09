import { Capacitor, registerPlugin } from "@capacitor/core";

export interface WorkoutActivityState {
  exerciseName: string;
  isResting: boolean;
  restEndEpochMs: number;
  restTotalSec: number;
  status: string;
}

interface LiveActivityPlugin {
  start(data: WorkoutActivityState): Promise<void>;
  update(data: WorkoutActivityState): Promise<void>;
  end(): Promise<void>;
}

const Native = registerPlugin<LiveActivityPlugin>("LiveActivity");

let active = false;

function enabled(): boolean {
  if (Capacitor.getPlatform() !== "ios") return false;
  try {
    return localStorage.getItem("liveActivitiesEnabled") !== "false";
  } catch {
    return true;
  }
}

export async function startWorkoutActivity(data: WorkoutActivityState): Promise<void> {
  if (!enabled()) return;
  try {
    await Native.start(data);
    active = true;
  } catch (e) {
    console.error("[LiveActivity] start failed", e);
  }
}

export async function updateWorkoutActivity(data: WorkoutActivityState): Promise<void> {
  if (!active || !enabled()) return;
  try {
    await Native.update(data);
  } catch (e) {
    console.error("[LiveActivity] update failed", e);
  }
}

export async function endWorkoutActivity(): Promise<void> {
  if (!active) return;
  try {
    await Native.end();
  } catch (e) {
    console.error("[LiveActivity] end failed", e);
  } finally {
    active = false;
  }
}
