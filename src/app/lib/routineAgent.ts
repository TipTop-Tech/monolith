import type { Exercise, Routine, RoutineExercise } from "../context/WorkoutContext";

/**
 * LOCAL ROUTINE AGENT — NO API KEY REQUIRED
 *
 * This file intentionally does not call OpenAI or any external API.
 * The routine generator works as a deterministic, frontend-only planning agent:
 *
 *   user prompt + duration/profile fields
 *     -> keyword parsing
 *     -> clarification gate
 *     -> local exercise dictionary lookup
 *     -> routine construction rules
 *     -> bodyweight-based starting weight formula
 *
 * The dictionary below is the source of truth. To improve the agent, expand the
 * EXERCISE_KNOWLEDGE entries rather than adding live web retrieval.
 */

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
  | "legs"
  | "shoulders"
  | "glutes"
  | "mobility";

type Intensity = "recovery" | "light" | "moderate" | "heavy";

type FormulaGroup = "chest" | "legs" | "back" | "arms" | "bodyweight";

type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal-push"
  | "vertical-push"
  | "horizontal-pull"
  | "vertical-pull"
  | "curl"
  | "triceps"
  | "core-flexion"
  | "core-stability"
  | "rotation"
  | "carry"
  | "calf"
  | "hip"
  | "shoulder-health"
  | "mobility"
  | "neck";

type Equipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "band" | "other";

type ExerciseKnowledge = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  focus: TrainingFocus[];
  movement: MovementPattern[];
  equipment: Equipment[];
  formulaGroup: FormulaGroup;
  difficulty: "beginner" | "intermediate" | "advanced";
  defaultSets: number;
  repRange: [number, number];
  minutesEstimate: number;
  tags: string[];
  note: string;
};

export const STARTING_WEIGHT_MULTIPLIERS: Record<Exclude<FormulaGroup, "bodyweight">, number> = {
  legs: 0.45,
  back: 0.55,
  chest: 0.35,
  arms: 0.1,
};

const EXPERIENCE_WEIGHT_FACTOR: Record<TrainingExperience, number> = {
  beginner: 0.75,
  intermediate: 1,
  advanced: 1.15,
};

const SEX_WEIGHT_FACTOR: Record<TrainingSex, number> = {
  unspecified: 0.85,
  male: 1,
  female: 0.65,
  other: 0.85,
};

const INTENSITY_WEIGHT_FACTOR: Record<Intensity, number> = {
  recovery: 0.55,
  light: 0.7,
  moderate: 0.85,
  heavy: 1,
};

const DIFFICULTY_RANK: Record<ExerciseKnowledge["difficulty"], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const EXPERIENCE_RANK: Record<TrainingExperience, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

/**
 * StrengthLog-style local dictionary.
 * Key format must be normalizeExerciseName(exercise.name).
 */
export const EXERCISE_KNOWLEDGE: Record<string, ExerciseKnowledge> = {
  "bench press": {
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    focus: ["upper", "push", "chest"],
    movement: ["horizontal-push"],
    equipment: ["barbell"],
    formulaGroup: "chest",
    difficulty: "intermediate",
    defaultSets: 4,
    repRange: [6, 10],
    minutesEstimate: 8,
    tags: ["compound", "push", "strength"],
    note: "Main compound chest lift; start conservatively and warm up first.",
  },
  "incline bench press": {
    primaryMuscles: ["chest", "front-deltoids"],
    secondaryMuscles: ["triceps"],
    focus: ["upper", "push", "chest", "shoulders"],
    movement: ["horizontal-push"],
    equipment: ["barbell"],
    formulaGroup: "chest",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 10],
    minutesEstimate: 7,
    tags: ["compound", "push"],
    note: "Upper-chest press; use lighter weight than flat bench.",
  },
  "dumbbell press": {
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    focus: ["upper", "push", "chest"],
    movement: ["horizontal-push"],
    equipment: ["dumbbell"],
    formulaGroup: "chest",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["compound", "push", "dumbbell"],
    note: "Good alternative to bench press with easier load control.",
  },
  "smith chest press": {
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    focus: ["upper", "push", "chest"],
    movement: ["horizontal-push"],
    equipment: ["machine"],
    formulaGroup: "chest",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["machine", "push"],
    note: "Stable chest press option for controlled reps.",
  },
  "chest fly": {
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-deltoids"],
    focus: ["upper", "push", "chest"],
    movement: ["horizontal-push"],
    equipment: ["machine", "dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "push"],
    note: "Chest isolation; keep the load light and controlled.",
  },
  "squat": {
    primaryMuscles: ["quadriceps", "gluteal"],
    secondaryMuscles: ["hamstring", "abs", "lower-back"],
    focus: ["lower", "legs", "glutes", "full"],
    movement: ["squat"],
    equipment: ["barbell"],
    formulaGroup: "legs",
    difficulty: "intermediate",
    defaultSets: 4,
    repRange: [6, 10],
    minutesEstimate: 9,
    tags: ["compound", "legs", "strength"],
    note: "Main lower-body compound lift; prioritize depth and control.",
  },
  "front squat": {
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["gluteal", "abs", "upper-back"],
    focus: ["lower", "legs", "full"],
    movement: ["squat"],
    equipment: ["barbell"],
    formulaGroup: "legs",
    difficulty: "advanced",
    defaultSets: 3,
    repRange: [6, 8],
    minutesEstimate: 8,
    tags: ["compound", "legs", "quad"],
    note: "Quad-focused squat; use lighter weight than back squat.",
  },
  "smith squat": {
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["gluteal", "hamstring"],
    focus: ["lower", "legs"],
    movement: ["squat"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["machine", "legs"],
    note: "Stable squat variation for controlled leg work.",
  },
  "leg press": {
    primaryMuscles: ["quadriceps", "gluteal"],
    secondaryMuscles: ["hamstring"],
    focus: ["lower", "legs", "glutes"],
    movement: ["squat"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 6,
    tags: ["compound", "machine", "legs"],
    note: "Machine leg compound; keep full control and avoid locking knees.",
  },
  "bulgarian split squat": {
    primaryMuscles: ["quadriceps", "gluteal"],
    secondaryMuscles: ["hamstring", "abs"],
    focus: ["lower", "legs", "glutes"],
    movement: ["squat"],
    equipment: ["dumbbell", "bodyweight"],
    formulaGroup: "legs",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 7,
    tags: ["single-leg", "legs", "balance"],
    note: "Single-leg work; start bodyweight if balance is hard.",
  },
  "leg extensions": {
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["squat"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "quad", "machine"],
    note: "Quad isolation; controlled tempo matters more than weight.",
  },
  "leg curls": {
    primaryMuscles: ["hamstring"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["hinge"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "hamstring", "machine"],
    note: "Hamstring isolation; avoid using momentum.",
  },
  "deadlift": {
    primaryMuscles: ["lower-back", "gluteal", "hamstring"],
    secondaryMuscles: ["mid-back", "forearm", "abs"],
    focus: ["lower", "back", "legs", "full", "pull"],
    movement: ["hinge"],
    equipment: ["barbell"],
    formulaGroup: "back",
    difficulty: "advanced",
    defaultSets: 3,
    repRange: [4, 6],
    minutesEstimate: 10,
    tags: ["compound", "hinge", "strength"],
    note: "High-fatigue hinge; keep volume low and form strict.",
  },
  "romanian deadlift": {
    primaryMuscles: ["hamstring", "gluteal"],
    secondaryMuscles: ["lower-back"],
    focus: ["lower", "legs", "glutes", "back"],
    movement: ["hinge"],
    equipment: ["barbell", "dumbbell"],
    formulaGroup: "back",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 10],
    minutesEstimate: 7,
    tags: ["hinge", "posterior-chain"],
    note: "Posterior-chain hinge; stop when hamstrings stretch deeply.",
  },
  "hip thrusts": {
    primaryMuscles: ["gluteal"],
    secondaryMuscles: ["hamstring"],
    focus: ["lower", "glutes", "legs"],
    movement: ["hip"],
    equipment: ["barbell", "machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["glute", "hip"],
    note: "Glute-focused; pause briefly at the top.",
  },
  "glute bridge": {
    primaryMuscles: ["gluteal"],
    secondaryMuscles: ["hamstring"],
    focus: ["lower", "glutes", "mobility"],
    movement: ["hip"],
    equipment: ["bodyweight", "barbell"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["glute", "activation", "recovery"],
    note: "Low-fatigue glute activation; useful for warmups or recovery days.",
  },
  "cable kickbacks": {
    primaryMuscles: ["gluteal"],
    secondaryMuscles: ["hamstring"],
    focus: ["lower", "glutes"],
    movement: ["hip"],
    equipment: ["cable"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 15],
    minutesEstimate: 5,
    tags: ["isolation", "glute"],
    note: "Glute isolation; use a smooth controlled kickback.",
  },
  "pull-ups": {
    primaryMuscles: ["lats", "mid-back"],
    secondaryMuscles: ["biceps", "back-deltoids"],
    focus: ["upper", "pull", "back"],
    movement: ["vertical-pull"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [6, 10],
    minutesEstimate: 6,
    tags: ["compound", "pull", "bodyweight"],
    note: "Vertical pull; use assisted reps if needed.",
  },
  "lat pulldown": {
    primaryMuscles: ["lats", "mid-back"],
    secondaryMuscles: ["biceps"],
    focus: ["upper", "pull", "back"],
    movement: ["vertical-pull"],
    equipment: ["cable", "machine"],
    formulaGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["compound", "pull", "swimmer"],
    note: "Back-focused vertical pull; strong fit for swimmers.",
  },
  "straight arm pulldown": {
    primaryMuscles: ["lats"],
    secondaryMuscles: ["triceps", "abs"],
    focus: ["upper", "pull", "back"],
    movement: ["vertical-pull"],
    equipment: ["cable"],
    formulaGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["swimmer", "lat", "isolation"],
    note: "Lat isolation with low joint stress; useful for swimmers.",
  },
  "barbell rows": {
    primaryMuscles: ["mid-back", "upper-back"],
    secondaryMuscles: ["biceps", "lower-back"],
    focus: ["upper", "pull", "back"],
    movement: ["horizontal-pull"],
    equipment: ["barbell"],
    formulaGroup: "back",
    difficulty: "intermediate",
    defaultSets: 4,
    repRange: [6, 10],
    minutesEstimate: 8,
    tags: ["compound", "pull"],
    note: "Heavy row; brace your core and avoid swinging.",
  },
  "t-bar rows": {
    primaryMuscles: ["mid-back", "upper-back"],
    secondaryMuscles: ["biceps", "back-deltoids"],
    focus: ["upper", "pull", "back"],
    movement: ["horizontal-pull"],
    equipment: ["machine", "barbell"],
    formulaGroup: "back",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 10],
    minutesEstimate: 7,
    tags: ["compound", "pull"],
    note: "Row variation for mid-back thickness.",
  },
  "seated cable rows": {
    primaryMuscles: ["mid-back"],
    secondaryMuscles: ["biceps", "back-deltoids"],
    focus: ["upper", "pull", "back"],
    movement: ["horizontal-pull"],
    equipment: ["cable"],
    formulaGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 6,
    tags: ["compound", "pull", "cable"],
    note: "Controlled horizontal pull; squeeze shoulder blades back.",
  },
  "wide grip row": {
    primaryMuscles: ["upper-back", "back-deltoids"],
    secondaryMuscles: ["mid-back", "biceps"],
    focus: ["upper", "pull", "back", "shoulders"],
    movement: ["horizontal-pull"],
    equipment: ["machine", "cable"],
    formulaGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 6,
    tags: ["upper-back", "pull"],
    note: "Upper-back row; keep elbows high and controlled.",
  },
  "row machine": {
    primaryMuscles: ["mid-back", "lower-back"],
    secondaryMuscles: ["biceps", "legs"],
    focus: ["upper", "pull", "back", "full"],
    movement: ["horizontal-pull"],
    equipment: ["machine"],
    formulaGroup: "back",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 6,
    tags: ["machine", "conditioning", "pull"],
    note: "Good general pulling/conditioning movement.",
  },
  "back extensions": {
    primaryMuscles: ["lower-back"],
    secondaryMuscles: ["gluteal", "hamstring"],
    focus: ["back", "lower", "glutes"],
    movement: ["hinge"],
    equipment: ["bodyweight", "machine"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["posterior-chain", "bodyweight"],
    note: "Lower-back/posterior-chain accessory; avoid overextending.",
  },
  "good mornings": {
    primaryMuscles: ["lower-back", "hamstring"],
    secondaryMuscles: ["gluteal"],
    focus: ["back", "lower", "legs"],
    movement: ["hinge"],
    equipment: ["barbell"],
    formulaGroup: "back",
    difficulty: "advanced",
    defaultSets: 3,
    repRange: [8, 10],
    minutesEstimate: 6,
    tags: ["posterior-chain", "hinge"],
    note: "Advanced hinge; keep it light and controlled.",
  },
  "shoulder press": {
    primaryMuscles: ["front-deltoids"],
    secondaryMuscles: ["triceps", "upper-back"],
    focus: ["upper", "push", "shoulders"],
    movement: ["vertical-push"],
    equipment: ["dumbbell", "barbell", "machine"],
    formulaGroup: "arms",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 10],
    minutesEstimate: 6,
    tags: ["compound", "push", "shoulders"],
    note: "Overhead press; reduce load if shoulders are sore.",
  },
  "lateral raises": {
    primaryMuscles: ["back-deltoids", "upper-back"],
    secondaryMuscles: ["front-deltoids"],
    focus: ["upper", "push", "shoulders"],
    movement: ["vertical-push"],
    equipment: ["dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 15],
    minutesEstimate: 5,
    tags: ["isolation", "shoulders"],
    note: "Shoulder isolation; light weight and strict form.",
  },
  "front raises": {
    primaryMuscles: ["front-deltoids"],
    secondaryMuscles: [],
    focus: ["upper", "push", "shoulders"],
    movement: ["vertical-push"],
    equipment: ["dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [12, 15],
    minutesEstimate: 4,
    tags: ["isolation", "shoulders"],
    note: "Front-delt isolation; use very light load.",
  },
  "rear delt fly": {
    primaryMuscles: ["back-deltoids"],
    secondaryMuscles: ["mid-back"],
    focus: ["upper", "pull", "shoulders", "back"],
    movement: ["shoulder-health", "horizontal-pull"],
    equipment: ["dumbbell", "machine"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 15],
    minutesEstimate: 5,
    tags: ["shoulder-health", "pull", "swimmer"],
    note: "Rear-delt movement; useful for posture and shoulder balance.",
  },
  "reverse fly": {
    primaryMuscles: ["back-deltoids"],
    secondaryMuscles: ["mid-back"],
    focus: ["upper", "pull", "shoulders", "back"],
    movement: ["shoulder-health", "horizontal-pull"],
    equipment: ["dumbbell", "machine"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 15],
    minutesEstimate: 5,
    tags: ["shoulder-health", "pull", "swimmer"],
    note: "Shoulder-health pull; light controlled reps.",
  },
  "face pulls": {
    primaryMuscles: ["back-deltoids", "upper-back"],
    secondaryMuscles: ["mid-back"],
    focus: ["upper", "pull", "shoulders", "back", "mobility"],
    movement: ["shoulder-health", "horizontal-pull"],
    equipment: ["cable", "band"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["shoulder-health", "recovery", "swimmer"],
    note: "Great shoulder-health accessory; keep it light.",
  },
  "scapular retractions": {
    primaryMuscles: ["mid-back", "upper-back"],
    secondaryMuscles: ["back-deltoids"],
    focus: ["upper", "pull", "back", "mobility"],
    movement: ["shoulder-health"],
    equipment: ["bodyweight", "band"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [10, 15],
    minutesEstimate: 4,
    tags: ["activation", "recovery", "swimmer"],
    note: "Low-fatigue scapular control drill.",
  },
  "resistance band pull-aparts": {
    primaryMuscles: ["upper-back", "back-deltoids"],
    secondaryMuscles: ["mid-back"],
    focus: ["upper", "pull", "shoulders", "mobility"],
    movement: ["shoulder-health"],
    equipment: ["band"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [15, 20],
    minutesEstimate: 4,
    tags: ["activation", "recovery", "swimmer"],
    note: "Band shoulder-health work; good warmup or recovery choice.",
  },
  "upright rows": {
    primaryMuscles: ["upper-back", "back-deltoids"],
    secondaryMuscles: ["front-deltoids", "biceps"],
    focus: ["upper", "pull", "shoulders"],
    movement: ["horizontal-pull"],
    equipment: ["barbell", "dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 5,
    tags: ["shoulders", "pull"],
    note: "Use a comfortable range and avoid shoulder pinching.",
  },
  "bicep curls": {
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearm"],
    focus: ["upper", "pull", "arms"],
    movement: ["curl"],
    equipment: ["dumbbell", "barbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 5,
    tags: ["isolation", "arms"],
    note: "Biceps isolation; avoid swinging.",
  },
  "hammer curls": {
    primaryMuscles: ["biceps", "forearm"],
    secondaryMuscles: [],
    focus: ["upper", "pull", "arms"],
    movement: ["curl"],
    equipment: ["dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "forearms"],
    note: "Biceps/forearm curl; neutral grip.",
  },
  "cable hammer curls": {
    primaryMuscles: ["biceps", "forearm"],
    secondaryMuscles: [],
    focus: ["upper", "pull", "arms"],
    movement: ["curl"],
    equipment: ["cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "forearms"],
    note: "Cable curl variation with constant tension.",
  },
  "preacher curls": {
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    focus: ["upper", "pull", "arms"],
    movement: ["curl"],
    equipment: ["machine", "barbell", "dumbbell"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 12],
    minutesEstimate: 5,
    tags: ["isolation", "arms"],
    note: "Strict curl; do not overload the bottom position.",
  },
  "cable curls": {
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearm"],
    focus: ["upper", "pull", "arms"],
    movement: ["curl"],
    equipment: ["cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "cable"],
    note: "Controlled biceps isolation with cable tension.",
  },
  "tricep extensions": {
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    focus: ["upper", "push", "arms"],
    movement: ["triceps"],
    equipment: ["dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "push"],
    note: "Triceps isolation; keep elbows stable.",
  },
  "overhead tricep extension": {
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    focus: ["upper", "push", "arms"],
    movement: ["triceps"],
    equipment: ["dumbbell", "cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "push"],
    note: "Long-head triceps work; keep load controlled.",
  },
  "tricep pushdown": {
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    focus: ["upper", "push", "arms"],
    movement: ["triceps"],
    equipment: ["cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "cable"],
    note: "Simple triceps cable isolation.",
  },
  "skull crushers": {
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    focus: ["upper", "push", "arms"],
    movement: ["triceps"],
    equipment: ["barbell", "dumbbell"],
    formulaGroup: "arms",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 5,
    tags: ["isolation", "arms", "push"],
    note: "Triceps lift; start light and protect elbows.",
  },
  "tricep dips": {
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "front-deltoids"],
    focus: ["upper", "push", "arms", "chest"],
    movement: ["triceps", "horizontal-push"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [8, 12],
    minutesEstimate: 5,
    tags: ["bodyweight", "push", "arms"],
    note: "Bodyweight triceps/chest movement; avoid shoulder discomfort.",
  },
  "crunches": {
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    focus: ["core", "full"],
    movement: ["core-flexion"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [15, 25],
    minutesEstimate: 4,
    tags: ["core", "bodyweight"],
    note: "Basic core flexion; keep reps controlled.",
  },
  "decline crunches": {
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    focus: ["core"],
    movement: ["core-flexion"],
    equipment: ["bodyweight", "other"],
    formulaGroup: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["core", "bodyweight"],
    note: "Harder crunch variation; use slow reps.",
  },
  "cable crunches": {
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    focus: ["core"],
    movement: ["core-flexion"],
    equipment: ["cable"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["core", "cable"],
    note: "Weighted core flexion; keep hips stable.",
  },
  "planks": {
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques", "lower-back"],
    focus: ["core", "full", "mobility"],
    movement: ["core-stability"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [30, 60],
    minutesEstimate: 4,
    tags: ["core", "stability", "bodyweight"],
    note: "Core stability hold; keep ribs down and hips level.",
  },
  "side planks": {
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["abs", "gluteal"],
    focus: ["core", "mobility"],
    movement: ["core-stability"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [20, 45],
    minutesEstimate: 4,
    tags: ["core", "stability", "obliques"],
    note: "Oblique stability; do both sides.",
  },
  "russian twists": {
    primaryMuscles: ["obliques", "abs"],
    secondaryMuscles: [],
    focus: ["core"],
    movement: ["rotation"],
    equipment: ["bodyweight", "dumbbell"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [16, 24],
    minutesEstimate: 4,
    tags: ["core", "rotation"],
    note: "Rotational core movement; rotate with control.",
  },
  "decline twists": {
    primaryMuscles: ["abs", "obliques"],
    secondaryMuscles: [],
    focus: ["core"],
    movement: ["rotation"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["core", "rotation"],
    note: "Harder rotational core option.",
  },
  "leg raises": {
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hip-flexors"],
    focus: ["core"],
    movement: ["core-flexion"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 4,
    tags: ["core", "bodyweight"],
    note: "Lower-ab focused; avoid swinging.",
  },
  "woodchoppers": {
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["abs", "shoulders"],
    focus: ["core", "full"],
    movement: ["rotation"],
    equipment: ["cable", "dumbbell"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [10, 15],
    minutesEstimate: 5,
    tags: ["core", "rotation", "athletic"],
    note: "Rotational core accessory; useful for athletic training.",
  },
  "bird dog": {
    primaryMuscles: ["lower-back", "abs"],
    secondaryMuscles: ["gluteal"],
    focus: ["core", "mobility", "full"],
    movement: ["core-stability", "mobility"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [8, 12],
    minutesEstimate: 4,
    tags: ["recovery", "stability", "bodyweight"],
    note: "Low-fatigue core/back stability drill.",
  },
  "standing calf raises": {
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["calf"],
    equipment: ["machine", "dumbbell", "bodyweight"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 4,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["calves", "isolation"],
    note: "Calf work; pause at top and stretch at bottom.",
  },
  "seated calf raises": {
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["calf"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 4,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["calves", "isolation"],
    note: "Seated calf isolation; controlled full range.",
  },
  "calf press": {
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["calf"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 4,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["calves", "machine"],
    note: "Machine calf movement; use slow reps.",
  },
  "calf extension machine": {
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    focus: ["lower", "legs"],
    movement: ["calf"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 4,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["calves", "machine"],
    note: "Machine calf extension; controlled full range.",
  },
  "adductor machine": {
    primaryMuscles: ["adductor"],
    secondaryMuscles: [],
    focus: ["lower", "legs", "mobility"],
    movement: ["hip"],
    equipment: ["machine"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 15],
    minutesEstimate: 5,
    tags: ["hip", "machine", "accessory"],
    note: "Inner-thigh accessory; use moderate load.",
  },
  "copenhagen plank": {
    primaryMuscles: ["adductor"],
    secondaryMuscles: ["abs", "obliques"],
    focus: ["lower", "core", "mobility"],
    movement: ["core-stability", "hip"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 2,
    repRange: [15, 30],
    minutesEstimate: 4,
    tags: ["adductor", "core", "stability"],
    note: "Adductor/core stability; scale with bent-knee version.",
  },
  "hip abductions": {
    primaryMuscles: ["abductors", "gluteal"],
    secondaryMuscles: [],
    focus: ["lower", "glutes", "mobility"],
    movement: ["hip"],
    equipment: ["machine", "band"],
    formulaGroup: "legs",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 5,
    tags: ["glute", "hip", "accessory"],
    note: "Hip/glute accessory; controlled reps.",
  },
  "lateral band walks": {
    primaryMuscles: ["abductors", "gluteal"],
    secondaryMuscles: [],
    focus: ["lower", "glutes", "mobility"],
    movement: ["hip", "mobility"],
    equipment: ["band"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["glute", "activation", "recovery"],
    note: "Glute activation drill; good warmup choice.",
  },
  "wrist curls": {
    primaryMuscles: ["forearm"],
    secondaryMuscles: [],
    focus: ["arms", "upper"],
    movement: ["curl"],
    equipment: ["dumbbell", "barbell"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["forearms", "isolation"],
    note: "Forearm isolation; start very light.",
  },
  "reverse wrist curls": {
    primaryMuscles: ["forearm"],
    secondaryMuscles: [],
    focus: ["arms", "upper"],
    movement: ["curl"],
    equipment: ["dumbbell", "barbell"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [12, 20],
    minutesEstimate: 4,
    tags: ["forearms", "isolation"],
    note: "Forearm extensor work; keep the load light.",
  },
  "farmer's carry": {
    primaryMuscles: ["forearm", "upper-back"],
    secondaryMuscles: ["abs", "gluteal"],
    focus: ["arms", "upper", "full", "core"],
    movement: ["carry", "core-stability"],
    equipment: ["dumbbell", "other"],
    formulaGroup: "arms",
    difficulty: "beginner",
    defaultSets: 3,
    repRange: [30, 60],
    minutesEstimate: 5,
    tags: ["grip", "carry", "full-body"],
    note: "Grip/core carry; use controlled walks.",
  },
  "neck flexion": {
    primaryMuscles: ["neck"],
    secondaryMuscles: [],
    focus: ["mobility"],
    movement: ["neck"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [10, 15],
    minutesEstimate: 3,
    tags: ["neck", "mobility"],
    note: "Neck work should stay very light and controlled.",
  },
  "neck extension": {
    primaryMuscles: ["neck"],
    secondaryMuscles: [],
    focus: ["mobility"],
    movement: ["neck"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [10, 15],
    minutesEstimate: 3,
    tags: ["neck", "mobility"],
    note: "Neck work should stay very light and controlled.",
  },
  "neck isometrics": {
    primaryMuscles: ["neck", "head"],
    secondaryMuscles: [],
    focus: ["mobility"],
    movement: ["neck"],
    equipment: ["bodyweight"],
    formulaGroup: "bodyweight",
    difficulty: "beginner",
    defaultSets: 2,
    repRange: [10, 20],
    minutesEstimate: 3,
    tags: ["neck", "isometric", "mobility"],
    note: "Gentle isometric holds only; avoid strain.",
  },
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeExerciseName(name: string) {
  return normalizeText(name)
    .replace(/dips$/, "dips")
    .replace(/curls$/, "curls");
}

function getKnowledge(exercise: Exercise): ExerciseKnowledge {
  const exact = EXERCISE_KNOWLEDGE[normalizeExerciseName(exercise.name)];
  if (exact) return exact;

  const muscles = exercise.muscleGroups.map(normalizeText);
  const has = (needle: string) => muscles.some((muscle) => muscle.includes(needle));

  if (has("chest")) {
    return fallbackKnowledge(["chest"], ["triceps", "front-deltoids"], ["upper", "push", "chest"], "horizontal-push", "chest");
  }
  if (has("quad") || has("hamstring") || has("glute") || has("calves")) {
    return fallbackKnowledge(muscles, [], ["lower", "legs"], "squat", "legs");
  }
  if (has("back") || has("lat")) {
    return fallbackKnowledge(muscles, ["biceps"], ["upper", "pull", "back"], "horizontal-pull", "back");
  }
  if (has("biceps") || has("triceps") || has("forearm")) {
    return fallbackKnowledge(muscles, [], ["upper", "arms"], "curl", "arms");
  }
  if (has("abs") || has("oblique")) {
    return fallbackKnowledge(muscles, [], ["core"], "core-stability", "bodyweight");
  }

  return fallbackKnowledge(muscles, [], ["full"], "mobility", "bodyweight");
}

function fallbackKnowledge(
  primaryMuscles: string[],
  secondaryMuscles: string[],
  focus: TrainingFocus[],
  movement: MovementPattern,
  formulaGroup: FormulaGroup
): ExerciseKnowledge {
  return {
    primaryMuscles,
    secondaryMuscles,
    focus,
    movement: [movement],
    equipment: [formulaGroup === "bodyweight" ? "bodyweight" : "other"],
    formulaGroup,
    difficulty: "beginner",
    defaultSets: 3,
    repRange: formulaGroup === "bodyweight" ? [10, 20] : [8, 12],
    minutesEstimate: 5,
    tags: ["fallback"],
    note: "General exercise recommendation from app muscle-group metadata.",
  };
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function parseFocus(prompt: string): TrainingFocus[] {
  const focuses: TrainingFocus[] = [];

  if (includesAny(prompt, ["upper", "upper body"])) focuses.push("upper");
  if (includesAny(prompt, ["lower", "lower body", "leg day", "legs", "quad", "hamstring", "calf"])) focuses.push("lower", "legs");
  if (includesAny(prompt, ["full body", "total body", "whole body", "balanced"])) focuses.push("full");
  if (includesAny(prompt, ["push", "chest and triceps"])) focuses.push("push");
  if (includesAny(prompt, ["pull", "back and biceps"])) focuses.push("pull");
  if (includesAny(prompt, ["arm", "arms", "bicep", "tricep", "forearm"])) focuses.push("arms");
  if (includesAny(prompt, ["core", "abs", "ab ", "oblique"])) focuses.push("core");
  if (includesAny(prompt, ["chest", "bench"])) focuses.push("chest", "push");
  if (includesAny(prompt, ["back", "lat", "row", "deadlift"])) focuses.push("back", "pull");
  if (includesAny(prompt, ["shoulder", "deltoid", "rotator"] )) focuses.push("shoulders");
  if (includesAny(prompt, ["glute", "butt", "hip thrust"])) focuses.push("glutes", "lower");
  if (includesAny(prompt, ["mobility", "stretch", "warmup", "warm up", "prehab"])) focuses.push("mobility");

  return unique(focuses);
}

function parseIntensity(prompt: string): Intensity {
  if (includesAny(prompt, ["sore", "recovery", "recover", "tired", "fatigued", "long set", "easy", "mobility", "light day", "not too heavy", "do not want to lift too heavy"])) {
    return "recovery";
  }
  if (includesAny(prompt, ["light", "beginner", "easy weights"])) return "light";
  if (includesAny(prompt, ["heavy", "strength", "max", "power", "hard", "intense"])) return "heavy";
  return "moderate";
}

function parseSports(prompt: string) {
  const sports: string[] = [];
  if (includesAny(prompt, ["swim", "swimmer", "freestyle", "backstroke", "butterfly", "breaststroke"])) sports.push("swimming");
  if (includesAny(prompt, ["run", "runner", "cross country", "track"])) sports.push("running");
  if (includesAny(prompt, ["soccer", "football"])) sports.push("soccer");
  if (includesAny(prompt, ["basketball", "hoop"])) sports.push("basketball");
  if (includesAny(prompt, ["golf", "golfer"])) sports.push("golf");
  if (includesAny(prompt, ["tennis", "pickleball", "racket"] )) sports.push("racket");
  return unique(sports);
}

function parseEquipment(prompt: string): Equipment[] {
  const equipment: Equipment[] = [];
  if (includesAny(prompt, ["barbell", "bench press", "squat rack"])) equipment.push("barbell");
  if (includesAny(prompt, ["dumbbell", "db ", "dbs"])) equipment.push("dumbbell");
  if (includesAny(prompt, ["machine", "machines"])) equipment.push("machine");
  if (includesAny(prompt, ["cable", "pulley"])) equipment.push("cable");
  if (includesAny(prompt, ["band", "resistance band"])) equipment.push("band");
  if (includesAny(prompt, ["bodyweight", "no equipment", "at home", "home workout"])) equipment.push("bodyweight");
  return unique(equipment);
}

function inferFocusFromSports(sports: string[]): TrainingFocus[] {
  const focus: TrainingFocus[] = [];
  if (sports.includes("swimming")) focus.push("back", "shoulders", "core", "mobility");
  if (sports.includes("running")) focus.push("legs", "glutes", "core", "mobility");
  if (sports.includes("soccer")) focus.push("legs", "glutes", "core");
  if (sports.includes("basketball")) focus.push("legs", "glutes", "core", "upper");
  if (sports.includes("golf") || sports.includes("racket")) focus.push("core", "back", "shoulders", "mobility");
  return unique(focus);
}

function targetExerciseCount(durationMinutes: number, intensity: Intensity) {
  if (durationMinutes <= 20) return 3;
  if (durationMinutes <= 35) return intensity === "recovery" ? 4 : 5;
  if (durationMinutes <= 50) return intensity === "recovery" ? 5 : 6;
  if (durationMinutes <= 70) return intensity === "recovery" ? 6 : 7;
  return intensity === "recovery" ? 7 : 8;
}

function determineRoutineName(focuses: TrainingFocus[], sports: string[], intensity: Intensity) {
  if (sports.includes("swimming") && focuses.includes("upper")) return "Swimmer Upper Body";
  if (sports.includes("swimming")) return "Swimmer Strength";
  if (intensity === "recovery") return "Recovery Routine";
  if (focuses.includes("push")) return "AI Push Routine";
  if (focuses.includes("pull")) return "AI Pull Routine";
  if (focuses.includes("legs") || focuses.includes("lower")) return "AI Lower Body";
  if (focuses.includes("upper")) return "AI Upper Body";
  if (focuses.includes("core")) return "AI Core Routine";
  return "AI Full Body";
}

function targetRepFor(knowledge: ExerciseKnowledge, intensity: Intensity) {
  if (knowledge.formulaGroup === "bodyweight") return knowledge.repRange[1];
  if (intensity === "heavy") return knowledge.repRange[0];
  if (intensity === "recovery" || intensity === "light") return knowledge.repRange[1];
  return Math.round((knowledge.repRange[0] + knowledge.repRange[1]) / 2);
}

function targetSetsFor(knowledge: ExerciseKnowledge, intensity: Intensity, durationMinutes: number) {
  let sets = knowledge.defaultSets;
  if (intensity === "recovery") sets = Math.max(2, sets - 1);
  if (intensity === "heavy" && knowledge.tags.includes("compound")) sets += 1;
  if (durationMinutes <= 25) sets = Math.min(sets, 3);
  return Math.max(2, Math.min(5, sets));
}

function roundToGymWeight(value: number, formulaGroup: FormulaGroup) {
  if (formulaGroup === "arms") {
    return Math.max(5, Math.round(value / 2.5) * 2.5);
  }
  return Math.max(5, Math.round(value / 5) * 5);
}

function calculateStartingWeight(
  knowledge: ExerciseKnowledge,
  bodyWeightLbs: number | null | undefined,
  sex: TrainingSex,
  experience: TrainingExperience,
  intensity: Intensity
) {
  if (!bodyWeightLbs || knowledge.formulaGroup === "bodyweight") return undefined;

  const baseMultiplier = STARTING_WEIGHT_MULTIPLIERS[knowledge.formulaGroup];
  const raw = bodyWeightLbs * baseMultiplier * SEX_WEIGHT_FACTOR[sex] * EXPERIENCE_WEIGHT_FACTOR[experience] * INTENSITY_WEIGHT_FACTOR[intensity];
  return roundToGymWeight(raw, knowledge.formulaGroup);
}

function scoreExercise(
  exercise: Exercise,
  focuses: TrainingFocus[],
  sports: string[],
  equipmentPreferences: Equipment[],
  intensity: Intensity,
  experience: TrainingExperience,
  selectedMovements: Set<MovementPattern>
) {
  const knowledge = getKnowledge(exercise);
  let score = 0;

  const focusHits = knowledge.focus.filter((focus) => focuses.includes(focus)).length;
  score += focusHits * 12;

  const muscleText = [...knowledge.primaryMuscles, ...knowledge.secondaryMuscles].join(" ");
  for (const focus of focuses) {
    if (muscleText.includes(focus)) score += 6;
  }

  if (sports.includes("swimming")) {
    if (knowledge.tags.includes("swimmer")) score += 16;
    if (knowledge.movement.includes("shoulder-health")) score += 10;
    if (knowledge.focus.includes("back") || knowledge.focus.includes("core")) score += 6;
    if (intensity === "recovery" && knowledge.movement.includes("vertical-push")) score -= 8;
  }

  if (sports.includes("running") || sports.includes("soccer") || sports.includes("basketball")) {
    if (knowledge.focus.includes("legs") || knowledge.focus.includes("glutes") || knowledge.focus.includes("core")) score += 8;
  }

  if (sports.includes("golf") || sports.includes("racket")) {
    if (knowledge.focus.includes("core") || knowledge.movement.includes("rotation") || knowledge.movement.includes("shoulder-health")) score += 10;
  }

  if (equipmentPreferences.length > 0) {
    const hasPreferredEquipment = knowledge.equipment.some((equipment) => equipmentPreferences.includes(equipment));
    score += hasPreferredEquipment ? 7 : -12;
  }

  if (intensity === "recovery") {
    if (knowledge.tags.includes("recovery") || knowledge.tags.includes("activation") || knowledge.movement.includes("shoulder-health")) score += 10;
    if (knowledge.difficulty === "advanced") score -= 12;
    if (knowledge.tags.includes("strength")) score -= 8;
  }

  if (intensity === "heavy") {
    if (knowledge.tags.includes("compound")) score += 9;
    if (knowledge.formulaGroup === "bodyweight") score -= 5;
  }

  if (DIFFICULTY_RANK[knowledge.difficulty] > EXPERIENCE_RANK[experience]) score -= 10;
  if (selectedMovements.size > 0 && knowledge.movement.some((movement) => selectedMovements.has(movement))) score -= 4;

  return score;
}

function pickExercises(
  exercises: Exercise[],
  focuses: TrainingFocus[],
  sports: string[],
  equipmentPreferences: Equipment[],
  intensity: Intensity,
  experience: TrainingExperience,
  count: number
) {
  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();
  const selectedMovements = new Set<MovementPattern>();

  const available = exercises.filter((exercise) => Boolean(exercise.id && exercise.name));

  while (selected.length < count && selected.length < available.length) {
    const best = available
      .filter((exercise) => !selectedIds.has(exercise.id))
      .map((exercise) => ({
        exercise,
        knowledge: getKnowledge(exercise),
        score: scoreExercise(exercise, focuses, sports, equipmentPreferences, intensity, experience, selectedMovements),
      }))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.knowledge.minutesEstimate - right.knowledge.minutesEstimate;
      })[0];

    if (!best) break;
    selected.push(best.exercise);
    selectedIds.add(best.exercise.id);
    best.knowledge.movement.forEach((movement) => selectedMovements.add(movement));
  }

  return selected;
}

function buildClarifyingQuestions(prompt: string, durationMinutes?: number | null) {
  const questions: string[] = [];
  const normalizedPrompt = normalizeText(prompt);
  const focuses = parseFocus(normalizedPrompt);
  const sports = parseSports(normalizedPrompt);
  const equipment = parseEquipment(normalizedPrompt);

  if (focuses.length === 0 && sports.length === 0) {
    questions.push("What body area should this focus on: upper body, lower body, push, pull, core, or full body?");
  }

  if (!durationMinutes || Number.isNaN(durationMinutes)) {
    questions.push("How long should the workout be: 20, 30, 45, or 60 minutes?");
  }

  if (!includesAny(normalizedPrompt, ["strength", "muscle", "hypertrophy", "recovery", "sore", "light", "heavy", "sport", "swim", "run", "athletic"])) {
    questions.push("Is the goal strength, muscle growth, athletic performance, or recovery?");
  }

  if (equipment.length === 0 && includesAny(normalizedPrompt, ["home", "limited", "available equipment", "equipment"])) {
    questions.push("What equipment does the user have available?");
  }

  return questions;
}

function isPromptTooVague(prompt: string, durationMinutes?: number | null) {
  const normalizedPrompt = normalizeText(prompt);
  const meaningfulWords = normalizedPrompt.split(" ").filter((word) => word.length > 2);
  const hasFocus = parseFocus(normalizedPrompt).length > 0;
  const hasSport = parseSports(normalizedPrompt).length > 0;
  const hasGoalOrIntensity = includesAny(normalizedPrompt, [
    "strength",
    "muscle",
    "hypertrophy",
    "recovery",
    "sore",
    "light",
    "heavy",
    "athletic",
    "mobility",
  ]);

  return meaningfulWords.length < 5 || (!hasFocus && !hasSport && !hasGoalOrIntensity) || !durationMinutes;
}

function buildCoachNotes(knowledge: ExerciseKnowledge, suggestedWeightLbs?: number) {
  const weightNote = suggestedWeightLbs ? ` Start around ${suggestedWeightLbs} lbs and adjust after warmup sets.` : " Use bodyweight or a comfortable starting load.";
  return `${knowledge.note}${weightNote}`;
}

function timeBudgetTrim(routineExercises: RoutineExercise[], pickedExercises: Exercise[], durationMinutes: number) {
  let totalMinutes = pickedExercises.reduce((sum, exercise) => sum + getKnowledge(exercise).minutesEstimate, 0);
  const trimmedExercises = [...routineExercises];

  while (totalMinutes > durationMinutes + 8 && trimmedExercises.length > 3) {
    const removed = trimmedExercises.pop();
    if (!removed) break;
    const removedExercise = pickedExercises.find((exercise) => exercise.id === removed.exerciseId);
    if (removedExercise) totalMinutes -= getKnowledge(removedExercise).minutesEstimate;
  }

  return trimmedExercises;
}

export function generateRoutineWithAgent(exercises: Exercise[], input: RoutineAgentInput): RoutineAgentResult {
  const prompt = normalizeText(input.prompt || "");
  const durationMinutes = input.durationMinutes && input.durationMinutes > 0 ? input.durationMinutes : null;
  const sex = input.sex ?? "unspecified";
  const experience = input.experience ?? "beginner";

  if (!input.generateAnyway && isPromptTooVague(prompt, durationMinutes)) {
    return {
      status: "needs_clarification",
      message: "I can make this routine, but I need a little more detail to avoid giving a generic workout.",
      questions: buildClarifyingQuestions(prompt, durationMinutes),
    };
  }

  const sports = parseSports(prompt);
  const promptFocuses = parseFocus(prompt);
  const sportFocuses = inferFocusFromSports(sports);
  const focuses = unique([...promptFocuses, ...sportFocuses]);
  const finalFocuses: TrainingFocus[] = focuses.length > 0 ? focuses : ["full"];
  const intensity = parseIntensity(prompt);
  const equipmentPreferences = parseEquipment(prompt);
  const finalDuration = durationMinutes ?? 45;
  const count = targetExerciseCount(finalDuration, intensity);

  const pickedExercises = pickExercises(
    exercises,
    finalFocuses,
    sports,
    equipmentPreferences,
    intensity,
    experience,
    count
  );

  let routineExercises: RoutineExercise[] = pickedExercises.map((exercise) => {
    const knowledge = getKnowledge(exercise);
    const suggestedWeightLbs = calculateStartingWeight(knowledge, input.bodyWeightLbs, sex, experience, intensity);

    return {
      exerciseId: exercise.id,
      sets: targetSetsFor(knowledge, intensity, finalDuration),
      targetReps: targetRepFor(knowledge, intensity),
      suggestedWeightLbs,
      coachNotes: buildCoachNotes(knowledge, suggestedWeightLbs),
    };
  });

  routineExercises = timeBudgetTrim(routineExercises, pickedExercises, finalDuration);

  const assumptions: string[] = [];
  if (!durationMinutes) assumptions.push("Assumed a 45-minute workout because no duration was provided.");
  if (!input.bodyWeightLbs) assumptions.push("Skipped starting-weight estimates where body weight was not provided.");
  if (sex === "unspecified") assumptions.push("Used a conservative default strength factor because sex was unspecified.");
  if (promptFocuses.length === 0 && sportFocuses.length === 0) assumptions.push("Generated a balanced full-body routine because the prompt did not specify a focus.");
  if (equipmentPreferences.length === 0) assumptions.push("Assumed normal gym equipment is available.");
  if (intensity === "recovery") assumptions.push("Reduced intensity because the prompt suggested soreness, fatigue, or recovery.");

  const routine: Routine = {
    id: `ai-${Date.now()}`,
    name: determineRoutineName(finalFocuses, sports, intensity),
    exercises: routineExercises,
  };

  const summary = `Generated a ${finalDuration}-minute ${intensity} routine using the local exercise dictionary, no API key or external retrieval required.`;

  return {
    status: "ready",
    routine,
    summary,
    assumptions,
  };
}
