import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getHistoryFromDB, saveHistoryToDB, migrateFromLocalStorage } from "../../utils/storage";

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
  removeSet: (exerciseId: string, setIndex: number) => void;
  updateSet: (exerciseId: string, setIndex: number, reps: number, weight: number) => void;
  addRoutine: (routine: Routine) => void;
  removeRoutine: (routineId: string) => void;
  addExerciseToRoutine: (routineId: string, routineExercise: RoutineExercise) => void;
  removeRoutineExercise: (routineId: string, exerciseIndex: number) => void;

  // Active Workout UI State
  reps: number;
  setReps: (val: number) => void;
  weight: number;
  setWeight: (val: number) => void;
  restTime: number;
  setRestTime: (val: number) => void;
  timeRemaining: number;
  setTimeRemaining: (val: number | ((prev: number) => number)) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (val: boolean) => void;
  pickerType: "reps" | "weight" | "restTime" | null;
  setPickerType: (val: "reps" | "weight" | "restTime" | null) => void;
  weightUnit: string;
  setWeightUnit: (val: string) => void;
  workoutSessionStartedAt: number | null;
  setWorkoutSessionStartedAt: (val: number | null) => void;
  currentSlide: number;
  setCurrentSlide: (val: number) => void;
  currentView: number;
  setCurrentView: (val: number) => void;
  selectedRoutineId: string | null;
  setSelectedRoutineId: (val: string | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const SAMPLE_EXERCISES: Exercise[] = [
  { id: "1", name: "Bench Press", muscleGroups: ["chest", "triceps", "front-deltoids"] },
  { id: "2", name: "Squat", muscleGroups: ["quadriceps", "gluteal", "hamstring"] },
  { id: "3", name: "Deadlift", muscleGroups: ["mid-back", "lower-back", "gluteal", "hamstring"] },
  { id: "4", name: "Bicep Curls", muscleGroups: ["biceps"] },
  { id: "5", name: "Tricep Extensions", muscleGroups: ["triceps"] },
  { id: "6", name: "Shoulder Press", muscleGroups: ["front-deltoids", "triceps"] },
  { id: "7", name: "Pull-ups", muscleGroups: ["mid-back", "biceps", "back-deltoids"] },
  { id: "8", name: "Leg Press", muscleGroups: ["quadriceps", "gluteal"] },
  { id: "9", name: "Lat Pulldown", muscleGroups: ["lats", "mid-back", "biceps"] },
  { id: "10", name: "Chest Fly", muscleGroups: ["chest"] },
  { id: "11", name: "Incline Bench Press", muscleGroups: ["chest", "front-deltoids", "triceps"] },
  { id: "12", name: "Dumbbell Press", muscleGroups: ["chest", "triceps", "front-deltoids"] },
  { id: "13", name: "Lateral Raises", muscleGroups: ["back-deltoids", "upper-back"] },
  { id: "14", name: "Front Raises", muscleGroups: ["front-deltoids"] },
  { id: "15", name: "Rear Delt Fly", muscleGroups: ["back-deltoids", "mid-back"] },
  { id: "16", name: "Hammer Curls", muscleGroups: ["biceps", "forearm"] },
  { id: "17", name: "Preacher Curls", muscleGroups: ["biceps"] },
  { id: "18", name: "Cable Curls", muscleGroups: ["biceps", "forearm"] },
  { id: "19", name: "Tricep Dips", muscleGroups: ["triceps", "chest"] },
  { id: "20", name: "Overhead Tricep Extension", muscleGroups: ["triceps"] },
  { id: "21", name: "Skull Crushers", muscleGroups: ["triceps"] },
  { id: "22", name: "Barbell Rows", muscleGroups: ["mid-back", "biceps", "upper-back"] },
  { id: "23", name: "T-Bar Rows", muscleGroups: ["mid-back", "upper-back"] },
  { id: "24", name: "Seated Cable Rows", muscleGroups: ["mid-back", "biceps", "back-deltoids"] },
  { id: "25", name: "Face Pulls", muscleGroups: ["back-deltoids", "upper-back"] },
  { id: "26", name: "Shrugs", muscleGroups: ["upper-back"] },
  { id: "27", name: "Crunches", muscleGroups: ["abs"] },
  { id: "28", name: "Planks", muscleGroups: ["abs", "obliques"] },
  { id: "29", name: "Russian Twists", muscleGroups: ["obliques", "abs"] },
  { id: "30", name: "Leg Raises", muscleGroups: ["abs"] },
  { id: "31", name: "Cable Crunches", muscleGroups: ["abs"] },
  { id: "32", name: "Leg Extensions", muscleGroups: ["quadriceps"] },
  { id: "33", name: "Bulgarian Split Squat", muscleGroups: ["quadriceps", "gluteal"] },
  { id: "34", name: "Front Squat", muscleGroups: ["quadriceps"] },
  { id: "35", name: "Leg Curls", muscleGroups: ["hamstring"] },
  { id: "36", name: "Romanian Deadlift", muscleGroups: ["hamstring", "gluteal", "lower-back"] },
  { id: "37", name: "Nordic Curls", muscleGroups: ["hamstring"] },
  { id: "38", name: "Hip Thrusts", muscleGroups: ["gluteal"] },
  { id: "39", name: "Glute Bridge", muscleGroups: ["gluteal", "hamstring"] },
  { id: "40", name: "Cable Kickbacks", muscleGroups: ["gluteal"] },
  { id: "41", name: "Standing Calf Raises", muscleGroups: ["calves"] },
  { id: "42", name: "Seated Calf Raises", muscleGroups: ["calves"] },
  { id: "43", name: "Calf Press", muscleGroups: ["calves"] },
  { id: "44", name: "Back Extensions", muscleGroups: ["lower-back"] },
  { id: "45", name: "Good Mornings", muscleGroups: ["lower-back", "hamstring", "gluteal"] },
  { id: "46", name: "Upright Rows", muscleGroups: ["upper-back", "back-deltoids"] },
  { id: "47", name: "Woodchoppers", muscleGroups: ["obliques"] },
  { id: "48", name: "Side Planks", muscleGroups: ["obliques"] },
  { id: "49", name: "Adductor Machine", muscleGroups: ["adductor"] },
  { id: "50", name: "Copenhagen Plank", muscleGroups: ["adductor"] },
  { id: "51", name: "Hip Abductions", muscleGroups: ["abductors", "gluteal"] },
  { id: "52", name: "Lateral Band Walks", muscleGroups: ["abductors", "gluteal"] },
  { id: "53", name: "Wrist Curls", muscleGroups: ["forearm"] },
  { id: "54", name: "Reverse Wrist Curls", muscleGroups: ["forearm"] },
  { id: "55", name: "Farmer's Carry", muscleGroups: ["forearm", "upper-back"] },
  { id: "56", name: "Neck Flexion", muscleGroups: ["neck"] },
  { id: "57", name: "Neck Extension", muscleGroups: ["neck"] },
  { id: "58", name: "Neck Isometrics", muscleGroups: ["neck", "head"] },
  { id: "59", name: "Scapular Retractions", muscleGroups: ["mid-back", "upper-back"] },
  { id: "60", name: "Reverse Fly", muscleGroups: ["back-deltoids", "mid-back"] },
  { id: "61", name: "Straight Arm Pulldown", muscleGroups: ["lats", "triceps"] },
  { id: "62", name: "Resistance Band Pull-Aparts", muscleGroups: ["upper-back", "back-deltoids", "mid-back"] },
  { id: "63", name: "Bird Dog", muscleGroups: ["lower-back", "abs"] },
  { id: "64", name: "Wide Grip Row", muscleGroups: ["upper-back"] },
  { id: "65", name: "Row Machine", muscleGroups: ["mid-back", "lower-back"] },
  { id: "66", name: "Cable Hammer Curls", muscleGroups: ["biceps", "forearm"] },
  { id: "67", name: "Smith Chest Press", muscleGroups: ["chest"] },
  { id: "68", name: "Tricep Pushdown", muscleGroups: ["triceps"] },
  { id: "69", name: "Smith Squat", muscleGroups: ["quadriceps"] },
  { id: "70", name: "Decline Crunches", muscleGroups: ["abs"] },
  { id: "71", name: "Decline Twists", muscleGroups: ["abs"] },
  { id: "72", name: "Calf Extension Machine", muscleGroups: ["calves"] },
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

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [exercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const stored = localStorage.getItem("workoutRoutines");
    return stored ? JSON.parse(stored) : SAMPLE_ROUTINES;
  });
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Active Workout UI State
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [restTime, setRestTime] = useState(90);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pickerType, setPickerType] = useState<"reps" | "weight" | "restTime" | null>(null);
  const [weightUnit, setWeightUnit] = useState("LB");
  const [workoutSessionStartedAt, setWorkoutSessionStartedAt] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [currentView, setCurrentView] = useState(1);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);
  /*
  Initliazes user's workout history on applicaiton startup
  
  - It runs only once on mount
  - Attempts local storage migration
    - Retrieves from indexedDB if local storage migration fails
  - Updates states to reflect the user's workout history
  */
  useEffect(() => {
    const initHistory = async () => {
      let data = await migrateFromLocalStorage();
      if (!data) {
        data = await getHistoryFromDB();
      }
      if (!data || data.length === 0) {
        data = [];
      }
      setHistory(data);
      setIsHistoryLoaded(true);
    };
    initHistory();
  }, []);
  /**
   * This useEffect saves the user's workout routines to local storage
   * 
   * - It runs whenever the 'routines' state changes
   * - Saves the routines in a JSON format
   */
  useEffect(() => {
    localStorage.setItem("workoutRoutines", JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    if (isHistoryLoaded) {
      saveHistoryToDB(history).catch(e => console.error("Failed to save history to IndexedDB", e));
    }
  }, [history, isHistoryLoaded]);

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
  /**
   * This handles the removal of a set from the history.
   * 
   * @param exerciseId - The ID of the exercise to remove the set from
   * @param setIndex - The index of the set to remove
   */
  const removeSet = (exerciseId: string, setIndex: number) => {
    setHistory((prev) => {
      return prev
        .map((h) => {
          if (h.exerciseId !== exerciseId) return h;
          return {
            ...h,
            sets: h.sets.filter((_, index) => index !== setIndex),
          };
        })
        .filter((h) => h.sets.length > 0);
    });
  };

  const updateSet = (exerciseId: string, setIndex: number, reps: number, weight: number) => {
    setHistory((prev) => {
      return prev.map((h) => {
        if (h.exerciseId !== exerciseId) return h;
        const newSets = [...h.sets];
        newSets[setIndex] = { ...newSets[setIndex], reps, weight };
        return { ...h, sets: newSets };
      });
    });
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  const removeRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((routine) => routine.id !== routineId));

    if (currentRoutine?.id === routineId) {
      setCurrentRoutine(null);
      setCurrentExerciseIndex(0);
    }
  };

  const addExerciseToRoutine = (routineId: string, routineExercise: RoutineExercise) => {
    setRoutines((prev) => {
      const nextRoutines = prev.map((routine) =>
        routine.id === routineId
          ? {
            ...routine,
            exercises: [...routine.exercises, routineExercise],
          }
          : routine
      );

      const updatedRoutine = nextRoutines.find((routine) => routine.id === routineId) ?? null;
      if (currentRoutine?.id === routineId) {
        setCurrentRoutine(updatedRoutine);
      }

      return nextRoutines;
    });
  };

  const removeRoutineExercise = (routineId: string, exerciseIndex: number) => {
    setRoutines((prev) => {
      const nextRoutines = prev.map((routine) => {
        if (routine.id !== routineId) {
          return routine;
        }

        return {
          ...routine,
          exercises: routine.exercises.filter((_, index) => index !== exerciseIndex),
        };
      });

      const updatedRoutine = nextRoutines.find((routine) => routine.id === routineId) ?? null;
      if (currentRoutine?.id === routineId) {
        setCurrentRoutine(updatedRoutine);
      }

      return nextRoutines;
    });
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
        removeSet,
        updateSet,
        addRoutine,
        removeRoutine,
        addExerciseToRoutine,
        removeRoutineExercise,
        reps, setReps,
        weight, setWeight,
        restTime, setRestTime,
        timeRemaining, setTimeRemaining,
        isTimerRunning, setIsTimerRunning,
        pickerType, setPickerType,
        weightUnit, setWeightUnit,
        workoutSessionStartedAt, setWorkoutSessionStartedAt,
        currentSlide, setCurrentSlide,
        currentView, setCurrentView,
        selectedRoutineId, setSelectedRoutineId,
      }}
    >
      {/*
        Only renders the children when the history is loaded
      */}
      {isHistoryLoaded ? children : null}
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
