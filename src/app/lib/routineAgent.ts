import type { Exercise, Routine, RoutineExercise } from "../context/WorkoutContext";

export type TrainingSex = "unspecified" | "male" | "female" | "other";
export type TrainingExperience = "beginner" | "intermediate" | "advanced";

export type RoutineAgentInput = {
  prompt: string;
  durationMinutes?: number | null;
  bodyWeightLbs?: number | null;
  sex?: TrainingSex;
  experience?: TrainingExperience;
  generateAnyway?: boolean;
};

export type RoutineAgentNeedsClarification = {
  status: "needs_clarification";
  message: string;
  questions: string[];
};

export type RoutineAgentReady = {
  status: "ready";
  routine: Routine;
  summary: string;
  assumptions: string[];
};

export type RoutineAgentResult = RoutineAgentNeedsClarification | RoutineAgentReady;

type TrainingFocus =
  | "upper"
  | "lower"
  | "full"
  | "push"
  | "pull"
  | "arms"
  | "core"
  | "chest"
  | "back"
  | "legs";

type Intensity = "recovery" | "light" | "moderate";

type ExerciseKnowledge = {
  sourceGroup: "chest" | "shoulders" | "biceps" | "triceps" | "legs" | "back" | "glutes" | "abs" | "calves" | "forearms" | "neck" | "other";
  formulaGroup: "chest" | "legs" | "back" | "arms" | "bodyweight";
  tags: string[];
};

// Dictionary layer inspired by StrengthLog's exercise directory structure:
// exercise -> source group/muscles -> formula group. Keep this deterministic so the agent
// does not fetch conflicting sources at generation time.
export const EXERCISE_KNOWLEDGE: Record<string, ExerciseKnowledge> = {
  "bench press": { sourceGroup: "chest", formulaGroup: "chest", tags: ["compound", "push", "barbell"] },
  "incline bench press": { sourceGroup: "chest", formulaGroup: "chest", tags: ["compound", "push", "barbell"] },
  "dumbbell press": { sourceGroup: "chest", formulaGroup: "chest", tags: ["compound", "push", "dumbbell"] },
  "chest fly": { sourceGroup: "chest", formulaGroup: "chest", tags: ["isolation", "push"] },
  "tricep dips": { sourceGroup: "triceps", formulaGroup: "bodyweight", tags: ["compound", "push", "bodyweight"] },
  "squat": { sourceGroup: "legs", formulaGroup: "legs", tags: ["compound", "legs", "barbell"] },
  "front squat": { sourceGroup: "legs", formulaGroup: "legs", tags: ["compound", "legs", "barbell"] },
  "leg press": { sourceGroup: "legs", formulaGroup: "legs", tags: ["compound", "legs", "machine"] },
  "bulgarian split squat": { sourceGroup: "legs", formulaGroup: "legs", tags: ["compound", "legs", "single-leg"] },
  "leg extensions": { sourceGroup: "legs", formulaGroup: "legs", tags: ["isolation", "legs", "machine"] },
  "leg curls": { sourceGroup: "legs", formulaGroup: "legs", tags: ["isolation", "legs", "machine"] },
  "nordic curls": { sourceGroup: "legs", formulaGroup: "bodyweight", tags: ["isolation", "legs", "bodyweight"] },
  "deadlift": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull", "barbell"] },
  "romanian deadlift": { sourceGroup: "legs", formulaGroup: "back", tags: ["compound", "pull", "barbell"] },
  "good mornings": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull", "barbell"] },
  "back extensions": { sourceGroup: "back", formulaGroup: "bodyweight", tags: ["posterior-chain", "bodyweight"] },
  "barbell rows": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull", "barbell"] },
  "t-bar rows": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull"] },
  "seated cable rows": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull", "cable"] },
  "lat pulldown": { sourceGroup: "back", formulaGroup: "back", tags: ["compound", "pull", "cable"] },
  "pull-ups": { sourceGroup: "back", formulaGroup: "bodyweight", tags: ["compound", "pull", "bodyweight"] },
  "straight arm pulldown": { sourceGroup: "back", formulaGroup: "back", tags: ["isolation", "pull", "cable", "swimmer"] },
  "scapular retractions": { sourceGroup: "back", formulaGroup: "bodyweight", tags: ["activation", "recovery", "swimmer"] },
  "face pulls": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["recovery", "pull", "shoulder-health", "swimmer"] },
  "resistance band pull-aparts": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["recovery", "pull", "shoulder-health", "swimmer"] },
  "reverse fly": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["isolation", "pull", "shoulder-health"] },
  "rear delt fly": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["isolation", "pull", "shoulder-health"] },
  "lateral raises": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["isolation", "push"] },
  "front raises": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["isolation", "push"] },
  "shoulder press": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["compound", "push"] },
  "upright rows": { sourceGroup: "shoulders", formulaGroup: "arms", tags: ["compound", "pull"] },
  "bicep curls": { sourceGroup: "biceps", formulaGroup: "arms", tags: ["isolation", "pull"] },
  "hammer curls": { sourceGroup: "biceps", formulaGroup: "arms", tags: ["isolation", "pull", "forearms"] },
  "preacher curls": { sourceGroup: "biceps", formulaGroup: "arms", tags: ["isolation", "pull"] },
  "cable curls": { sourceGroup: "biceps", formulaGroup: "arms", tags: ["isolation", "pull"] },
  "tricep extensions": { sourceGroup: "triceps", formulaGroup: "arms", tags: ["isolation", "push"] },
  "overhead tricep extension": { sourceGroup: "triceps", formulaGroup: "arms", tags: ["isolation", "push"] },
  "skull crushers": { sourceGroup: "triceps", formulaGroup: "arms", tags: ["isolation", "push"] },
  "crunches": { sourceGroup: "abs", formulaGroup: "bodyweight", tags: ["core", "bodyweight"] },
  "planks": { sourceGroup: "abs", formulaGroup: "bodyweight", tags: ["core", "bodyweight", "swimmer"] },
  "russian twists": { sourceGroup: "abs", formulaGroup: "bodyweight", tags: ["core", "bodyweight", "rotation"] },
  "leg raises": { sourceGroup: "abs", formulaGroup: "bodyweight", tags: ["core", "bodyweight"] },
  "cable crunches": { sourceGroup: "abs", formulaGroup: "arms", tags: ["core", "cable"] },
  "woodchoppers": { sourceGroup: "abs", formulaGroup: "arms", tags: ["core", "rotation", "cable", "swimmer"] },
  "side planks": { sourceGroup: "abs", formulaGroup: "bodyweight", tags: ["core", "bodyweight", "swimmer"] },
  "hip thrusts": { sourceGroup: "glutes", formulaGroup: "legs", tags: ["glutes", "compound"] },
  "glute bridge": { sourceGroup: "glutes", formulaGroup: "bodyweight", tags: ["glutes", "recovery"] },
  "cable kickbacks": { sourceGroup: "glutes", formulaGroup: "arms", tags: ["glutes", "cable"] },
  "standing calf raises": { sourceGroup: "calves", formulaGroup: "legs", tags: ["calves"] },
  "seated calf raises": { sourceGroup: "calves", formulaGroup: "legs", tags: ["calves"] },
  "calf press": { sourceGroup: "calves", formulaGroup: "legs", tags: ["calves"] },
  "adductor machine": { sourceGroup: "legs", formulaGroup: "legs", tags: ["adductors", "machine"] },
  "copenhagen plank": { sourceGroup: "legs", formulaGroup: "bodyweight", tags: ["adductors", "bodyweight"] },
  "hip abductions": { sourceGroup: "glutes", formulaGroup: "legs", tags: ["abductors", "glutes"] },
  "lateral band walks": { sourceGroup: "glutes", formulaGroup: "bodyweight", tags: ["abductors", "glutes", "recovery"] },
  "wrist curls": { sourceGroup: "forearms", formulaGroup: "arms", tags: ["forearms", "grip"] },
  "reverse wrist curls": { sourceGroup: "forearms", formulaGroup: "arms", tags: ["forearms", "grip"] },
  "farmer's carry": { sourceGroup: "forearms", formulaGroup: "arms", tags: ["grip", "carry"] },
  "neck flexion": { sourceGroup: "neck", formulaGroup: "bodyweight", tags: ["neck"] },
  "neck extension": { sourceGroup: "neck", formulaGroup: "bodyweight", tags: ["neck"] },
  "neck isometrics": { sourceGroup: "neck", formulaGroup: "bodyweight", tags: ["neck"] },
  "bird dog": { sourceGroup: "back", formulaGroup: "bodyweight", tags: ["core", "recovery", "lower-back"] },
};

const STARTING_WEIGHT_MULTIPLIERS = {
  legs: 0.45,
  back: 0.55,
  chest: 0.35,
  arms: 0.1,
  bodyweight: 0,
} satisfies Record<ExerciseKnowledge["formulaGroup"], number>;

const SEX_FACTORS: Record<TrainingSex, number> = {
  unspecified: 0.9,
  male: 1,
  female: 0.75,
  other: 0.9,
};

const EXPERIENCE_FACTORS: Record<TrainingExperience, number> = {
  beginner: 0.85,
  intermediate: 1,
  advanced: 1.15,
};

const INTENSITY_FACTORS: Record<Intensity, number> = {
  recovery: 0.55,
  light: 0.7,
  moderate: 0.85,
};

const FOCUS_MUSCLES: Record<TrainingFocus, string[]> = {
  upper: ["chest", "front-deltoids", "back-deltoids", "biceps", "triceps", "mid-back", "upper-back", "lats", "abs"],
  lower: ["quadriceps", "hamstring", "gluteal", "calves", "adductor", "abductors", "lower-back"],
  legs: ["quadriceps", "hamstring", "gluteal", "calves", "adductor", "abductors"],
  full: ["chest", "mid-back", "quadriceps", "hamstring", "gluteal", "abs", "biceps", "triceps", "front-deltoids"],
  push: ["chest", "front-deltoids", "triceps", "quadriceps"],
  pull: ["mid-back", "upper-back", "lats", "biceps", "back-deltoids", "hamstring", "lower-back"],
  arms: ["biceps", "triceps", "forearm", "front-deltoids", "back-deltoids"],
  core: ["abs", "obliques", "lower-back"],
  chest: ["chest", "front-deltoids", "triceps"],
  back: ["mid-back", "upper-back", "lats", "lower-back", "back-deltoids", "biceps"],
};

const HEAVY_EXERCISE_NAMES = new Set([
  "squat",
  "front squat",
  "deadlift",
  "romanian deadlift",
  "good mornings",
  "barbell rows",
  "t-bar rows",
]);

function normalized(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDuration(prompt: string, explicitDuration?: number | null) {
  if (explicitDuration && explicitDuration > 0) return explicitDuration;

  const lower = prompt.toLowerCase();
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(hour|hr|hours|hrs)/);
  if (hourMatch) return Math.round(Number(hourMatch[1]) * 60);

  const minuteMatch = lower.match(/(\d+)\s*(min|mins|minute|minutes)/);
  if (minuteMatch) return Number(minuteMatch[1]);

  return null;
}

function inferFocus(prompt: string): TrainingFocus | null {
  const lower = prompt.toLowerCase();
  if (/full\s*body|whole\s*body/.test(lower)) return "full";
  if (/upper/.test(lower)) return "upper";
  if (/lower/.test(lower)) return "lower";
  if (/leg|quad|hamstring|glute/.test(lower)) return "legs";
  if (/push/.test(lower)) return "push";
  if (/pull/.test(lower)) return "pull";
  if (/arm|bicep|tricep|forearm/.test(lower)) return "arms";
  if (/core|abs|oblique/.test(lower)) return "core";
  if (/chest|bench/.test(lower)) return "chest";
  if (/back|lat|row|deadlift/.test(lower)) return "back";
  return null;
}

function inferIntensity(prompt: string): Intensity {
  const lower = prompt.toLowerCase();
  if (/recovery|sore|soreness|long set|easy|mobility|light|do not lift too heavy|don't lift too heavy|not too heavy/.test(lower)) {
    return "recovery";
  }
  if (/beginner|first time|new|lighter|low intensity/.test(lower)) return "light";
  return "moderate";
}

function inferSport(prompt: string) {
  const lower = prompt.toLowerCase();
  if (/swim|swimmer|freestyle|butterfly|backstroke|breaststroke/.test(lower)) return "swimming";
  if (/basketball/.test(lower)) return "basketball";
  if (/soccer/.test(lower)) return "soccer";
  if (/run|runner|running|track|cross country/.test(lower)) return "running";
  return null;
}

function getFormulaGroup(exercise: Exercise): ExerciseKnowledge["formulaGroup"] {
  const known = EXERCISE_KNOWLEDGE[exercise.name.toLowerCase()];
  if (known) return known.formulaGroup;

  const groups = new Set(exercise.muscleGroups);
  if (groups.has("chest")) return "chest";
  if (groups.has("mid-back") || groups.has("upper-back") || groups.has("lower-back") || groups.has("lats")) return "back";
  if (groups.has("quadriceps") || groups.has("hamstring") || groups.has("gluteal") || groups.has("calves")) return "legs";
  if (groups.has("biceps") || groups.has("triceps") || groups.has("forearm") || groups.has("front-deltoids") || groups.has("back-deltoids")) return "arms";
  return "bodyweight";
}

function roundToNearestFive(value: number) {
  return Math.max(5, Math.round(value / 5) * 5);
}

function estimateStartingWeight(exercise: Exercise, input: RoutineAgentInput, intensity: Intensity) {
  const bodyWeight = input.bodyWeightLbs ?? null;
  if (!bodyWeight || bodyWeight <= 0) return undefined;

  const formulaGroup = getFormulaGroup(exercise);
  const baseMultiplier = STARTING_WEIGHT_MULTIPLIERS[formulaGroup];
  if (baseMultiplier === 0) return undefined;

  const sexFactor = SEX_FACTORS[input.sex ?? "unspecified"];
  const experienceFactor = EXPERIENCE_FACTORS[input.experience ?? "beginner"];
  const intensityFactor = INTENSITY_FACTORS[intensity];

  return roundToNearestFive(bodyWeight * baseMultiplier * sexFactor * experienceFactor * intensityFactor);
}

function exerciseScore(exercise: Exercise, targetMuscles: string[], prompt: string, intensity: Intensity, sport: string | null) {
  const lowerName = exercise.name.toLowerCase();
  const knowledge = EXERCISE_KNOWLEDGE[lowerName];
  let score = 0;

  for (const muscle of exercise.muscleGroups) {
    if (targetMuscles.includes(muscle)) score += 8;
  }

  if (knowledge?.tags.includes("compound")) score += intensity === "recovery" ? 0 : 3;
  if (knowledge?.tags.includes("isolation")) score += intensity === "recovery" ? 2 : 1;
  if (sport === "swimming" && knowledge?.tags.includes("swimmer")) score += 8;
  if (sport === "swimming" && ["lats", "mid-back", "abs", "obliques", "back-deltoids"].some((muscle) => exercise.muscleGroups.includes(muscle))) score += 4;
  if (intensity === "recovery" && knowledge?.tags.includes("recovery")) score += 8;
  if (intensity === "recovery" && HEAVY_EXERCISE_NAMES.has(lowerName)) score -= 12;
  if (/no heavy|not too heavy|do not lift too heavy|don't lift too heavy/.test(prompt.toLowerCase()) && HEAVY_EXERCISE_NAMES.has(lowerName)) score -= 8;

  return score;
}

function chooseExercises(exercises: Exercise[], focus: TrainingFocus, prompt: string, durationMinutes: number, intensity: Intensity, sport: string | null) {
  const targetMuscles = [...FOCUS_MUSCLES[focus]];

  if (sport === "swimming") {
    targetMuscles.push("lats", "mid-back", "back-deltoids", "abs", "obliques", "front-deltoids");
  }

  const exerciseCount = Math.min(7, Math.max(4, Math.round(durationMinutes / 10)));

  const scored = exercises
    .map((exercise) => ({ exercise, score: exerciseScore(exercise, targetMuscles, prompt, intensity, sport) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

  const selected: Exercise[] = [];
  const usedFormulaGroups = new Map<string, number>();

  for (const entry of scored) {
    const formulaGroup = getFormulaGroup(entry.exercise);
    const groupCount = usedFormulaGroups.get(formulaGroup) ?? 0;
    if (groupCount >= 3) continue;
    selected.push(entry.exercise);
    usedFormulaGroups.set(formulaGroup, groupCount + 1);
    if (selected.length >= exerciseCount) break;
  }

  if (selected.length < exerciseCount) {
    for (const entry of scored) {
      if (selected.some((exercise) => exercise.id === entry.exercise.id)) continue;
      selected.push(entry.exercise);
      if (selected.length >= exerciseCount) break;
    }
  }

  return selected;
}

function getSetRepScheme(exercise: Exercise, intensity: Intensity): Pick<RoutineExercise, "sets" | "targetReps"> {
  const formulaGroup = getFormulaGroup(exercise);
  const isBodyweight = formulaGroup === "bodyweight";

  if (intensity === "recovery") {
    return { sets: isBodyweight ? 3 : 2, targetReps: isBodyweight ? 12 : 15 };
  }

  if (formulaGroup === "legs" || formulaGroup === "back" || formulaGroup === "chest") {
    return { sets: 3, targetReps: 8 };
  }

  if (formulaGroup === "arms") {
    return { sets: 3, targetReps: 12 };
  }

  return { sets: 3, targetReps: 15 };
}

function makeRoutineName(focus: TrainingFocus, sport: string | null, intensity: Intensity) {
  const focusLabel: Record<TrainingFocus, string> = {
    upper: "Upper Body",
    lower: "Lower Body",
    full: "Full Body",
    push: "Push Day",
    pull: "Pull Day",
    arms: "Arms",
    core: "Core",
    chest: "Chest",
    back: "Back",
    legs: "Legs",
  };

  const prefix = intensity === "recovery" ? "Recovery" : sport === "swimming" ? "Swimmer" : "AI";
  return `${prefix} ${focusLabel[focus]}`;
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function generateRoutineWithAgent(exercises: Exercise[], input: RoutineAgentInput): RoutineAgentResult {
  const cleanPrompt = input.prompt.trim();
  const focus = inferFocus(cleanPrompt);
  const sport = inferSport(cleanPrompt);
  const durationMinutes = parseDuration(cleanPrompt, input.durationMinutes) ?? 45;
  const intensity = inferIntensity(cleanPrompt);

  const questions: string[] = [];
  if (!focus) questions.push("What body area should this target: upper body, lower body, full body, push, pull, arms, core, chest, or back?");
  if (!parseDuration(cleanPrompt, input.durationMinutes)) questions.push("How long should the routine be: 30, 45, 60, or 75 minutes?");
  if (!cleanPrompt && !sport) questions.push("Is this for a sport, recovery day, strength day, or general fitness?");

  if (questions.length > 0 && !input.generateAnyway) {
    return {
      status: "needs_clarification",
      message: "I can make this, but the request is vague. Add a little more detail or generate anyway and I will use safe defaults.",
      questions,
    };
  }

  const safeFocus = focus ?? "full";
  const selectedExercises = chooseExercises(exercises, safeFocus, cleanPrompt, durationMinutes, intensity, sport);
  const routineExercises: RoutineExercise[] = selectedExercises.map((exercise) => {
    const scheme = getSetRepScheme(exercise, intensity);
    const suggestedWeightLbs = estimateStartingWeight(exercise, input, intensity);
    const formulaGroup = getFormulaGroup(exercise);
    return {
      exerciseId: exercise.id,
      sets: scheme.sets,
      targetReps: scheme.targetReps,
      suggestedWeightLbs,
      coachNotes:
        suggestedWeightLbs !== undefined
          ? `Start around ${suggestedWeightLbs} lb using ${formulaGroup} multiplier; adjust down if form breaks.`
          : "Start with bodyweight or a very easy load and prioritize control.",
    };
  });

  const assumptions = [
    `Duration: ${durationMinutes} minutes`,
    `Focus: ${safeFocus}`,
    `Intensity: ${intensity}`,
  ];

  if (sport) assumptions.push(`Sport context: ${sport}`);
  if (!input.bodyWeightLbs) assumptions.push("No body weight entered, so some starting weights were left as bodyweight/light-load guidance.");
  if (!focus) assumptions.push("No body area was specified, so the agent defaulted to full body.");

  const routine: Routine = {
    id: makeId(),
    name: makeRoutineName(safeFocus, sport, intensity),
    exercises: routineExercises,
  };

  return {
    status: "ready",
    routine,
    summary: `Created ${routine.name} with ${routine.exercises.length} exercises.`,
    assumptions,
  };
}
