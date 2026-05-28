import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  date: string;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  targetReps: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface WorkoutHistory {
  exerciseId: string;
  sets: WorkoutSet[];
}

interface WorkoutContextType {
  exercises: Exercise[];
  routines: Routine[];
  history: WorkoutHistory[];
  currentRoutine: Routine | null;
  currentExerciseIndex: number;
  setCurrentRoutine: (routine: Routine | null) => void;
  setCurrentExerciseIndex: (index: number) => void;
  addSet: (exerciseId: string, reps: number, weight: number) => void;
  addRoutine: (routine: Routine) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const SAMPLE_EXERCISES: Exercise[] = [
  { id: "1", name: "Bench Press", muscleGroups: ["chest", "triceps", "shoulders"] },
  { id: "2", name: "Squat", muscleGroups: ["quads", "glutes", "hamstrings"] },
  { id: "3", name: "Deadlift", muscleGroups: ["back", "glutes", "hamstrings"] },
  { id: "4", name: "Bicep Curls", muscleGroups: ["biceps"] },
  { id: "5", name: "Tricep Extensions", muscleGroups: ["triceps"] },
  { id: "6", name: "Shoulder Press", muscleGroups: ["shoulders"] },
  { id: "7", name: "Pull-ups", muscleGroups: ["back", "biceps"] },
  { id: "8", name: "Leg Press", muscleGroups: ["quads", "glutes"] },
  { id: "9", name: "Lat Pulldown", muscleGroups: ["back"] },
  { id: "10", name: "Chest Fly", muscleGroups: ["chest"] },
  { id: "11", name: "Incline Bench Press", muscleGroups: ["chest", "shoulders"] },
  { id: "12", name: "Dumbbell Press", muscleGroups: ["chest", "triceps", "shoulders"] },
  { id: "13", name: "Lateral Raises", muscleGroups: ["shoulders"] },
  { id: "14", name: "Front Raises", muscleGroups: ["shoulders"] },
  { id: "15", name: "Rear Delt Fly", muscleGroups: ["shoulders", "back"] },
  { id: "16", name: "Hammer Curls", muscleGroups: ["biceps"] },
  { id: "17", name: "Preacher Curls", muscleGroups: ["biceps"] },
  { id: "18", name: "Cable Curls", muscleGroups: ["biceps"] },
  { id: "19", name: "Tricep Dips", muscleGroups: ["triceps", "chest"] },
  { id: "20", name: "Overhead Tricep Extension", muscleGroups: ["triceps"] },
  { id: "21", name: "Skull Crushers", muscleGroups: ["triceps"] },
  { id: "22", name: "Barbell Rows", muscleGroups: ["back", "biceps"] },
  { id: "23", name: "T-Bar Rows", muscleGroups: ["back"] },
  { id: "24", name: "Seated Cable Rows", muscleGroups: ["back", "biceps"] },
  { id: "25", name: "Face Pulls", muscleGroups: ["shoulders", "back"] },
  { id: "26", name: "Shrugs", muscleGroups: ["back", "shoulders"] },
  { id: "27", name: "Crunches", muscleGroups: ["abs"] },
  { id: "28", name: "Planks", muscleGroups: ["abs"] },
  { id: "29", name: "Russian Twists", muscleGroups: ["abs"] },
  { id: "30", name: "Leg Raises", muscleGroups: ["abs"] },
  { id: "31", name: "Cable Crunches", muscleGroups: ["abs"] },
  { id: "32", name: "Leg Extensions", muscleGroups: ["quads"] },
  { id: "33", name: "Bulgarian Split Squat", muscleGroups: ["quads", "glutes"] },
  { id: "34", name: "Front Squat", muscleGroups: ["quads"] },
  { id: "35", name: "Leg Curls", muscleGroups: ["hamstrings"] },
  { id: "36", name: "Romanian Deadlift", muscleGroups: ["hamstrings", "glutes", "back"] },
  { id: "37", name: "Nordic Curls", muscleGroups: ["hamstrings"] },
  { id: "38", name: "Hip Thrusts", muscleGroups: ["glutes"] },
  { id: "39", name: "Glute Bridge", muscleGroups: ["glutes", "hamstrings"] },
  { id: "40", name: "Cable Kickbacks", muscleGroups: ["glutes"] },
  { id: "41", name: "Standing Calf Raises", muscleGroups: ["calves"] },
  { id: "42", name: "Seated Calf Raises", muscleGroups: ["calves"] },
  { id: "43", name: "Calf Press", muscleGroups: ["calves"] },
];

const SAMPLE_ROUTINES: Routine[] = [
  {
    id: "1",
    name: "Upper Body",
    exercises: [
      { exerciseId: "1", sets: 4, targetReps: 8 },
      { exerciseId: "4", sets: 3, targetReps: 12 },
      { exerciseId: "6", sets: 3, targetReps: 10 },
      { exerciseId: "19", sets: 3, targetReps: 10 },
    ],
  },
  {
    id: "2",
    name: "Lower Body",
    exercises: [
      { exerciseId: "2", sets: 4, targetReps: 8 },
      { exerciseId: "3", sets: 3, targetReps: 6 },
      { exerciseId: "8", sets: 3, targetReps: 12 },
      { exerciseId: "41", sets: 4, targetReps: 15 },
    ],
  },
  {
    id: "3",
    name: "Push Day",
    exercises: [
      { exerciseId: "1", sets: 4, targetReps: 8 },
      { exerciseId: "11", sets: 3, targetReps: 10 },
      { exerciseId: "6", sets: 4, targetReps: 10 },
      { exerciseId: "13", sets: 3, targetReps: 12 },
      { exerciseId: "5", sets: 3, targetReps: 12 },
    ],
  },
  {
    id: "4",
    name: "Pull Day",
    exercises: [
      { exerciseId: "7", sets: 4, targetReps: 8 },
      { exerciseId: "22", sets: 4, targetReps: 8 },
      { exerciseId: "24", sets: 3, targetReps: 10 },
      { exerciseId: "4", sets: 3, targetReps: 12 },
      { exerciseId: "25", sets: 3, targetReps: 15 },
    ],
  },
  {
    id: "5",
    name: "Leg Day",
    exercises: [
      { exerciseId: "2", sets: 4, targetReps: 8 },
      { exerciseId: "36", sets: 4, targetReps: 8 },
      { exerciseId: "32", sets: 3, targetReps: 12 },
      { exerciseId: "35", sets: 3, targetReps: 12 },
      { exerciseId: "41", sets: 4, targetReps: 15 },
    ],
  },
  {
    id: "6",
    name: "Abs & Core",
    exercises: [
      { exerciseId: "27", sets: 4, targetReps: 20 },
      { exerciseId: "28", sets: 3, targetReps: 60 },
      { exerciseId: "29", sets: 3, targetReps: 20 },
      { exerciseId: "30", sets: 3, targetReps: 15 },
    ],
  },
];

const generateSampleHistory = (): WorkoutHistory[] => {
  const history: WorkoutHistory[] = [];
  const today = new Date();

  SAMPLE_EXERCISES.forEach((exercise) => {
    const sets: WorkoutSet[] = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 3);
      const baseWeight = 50 + Math.floor(Math.random() * 100);
      sets.push({
        reps: 8 + Math.floor(Math.random() * 4),
        weight: baseWeight + i * 2.5,
        date: date.toISOString(),
      });
    }
    history.push({ exerciseId: exercise.id, sets: sets.reverse() });
  });

  return history;
};

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [exercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const stored = localStorage.getItem("workoutRoutines");
    return stored ? JSON.parse(stored) : SAMPLE_ROUTINES;
  });
  const [history, setHistory] = useState<WorkoutHistory[]>(() => {
    const stored = localStorage.getItem("workoutHistory");
    return stored ? JSON.parse(stored) : generateSampleHistory();
  });
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem("workoutRoutines", JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem("workoutHistory", JSON.stringify(history));
  }, [history]);

  const addSet = (exerciseId: string, reps: number, weight: number) => {
    setHistory((prev) => {
      const exerciseHistory = prev.find((h) => h.exerciseId === exerciseId);
      const newSet: WorkoutSet = {
        reps,
        weight,
        date: new Date().toISOString(),
      };

      if (exerciseHistory) {
        return prev.map((h) =>
          h.exerciseId === exerciseId
            ? { ...h, sets: [...h.sets, newSet] }
            : h
        );
      } else {
        return [...prev, { exerciseId, sets: [newSet] }];
      }
    });
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        routines,
        history,
        currentRoutine,
        currentExerciseIndex,
        setCurrentRoutine,
        setCurrentExerciseIndex,
        addSet,
        addRoutine,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
