import { useEffect, useRef } from "react";
import { useWorkout } from "../context/WorkoutContext";
import {
  startWorkoutActivity,
  updateWorkoutActivity,
  endWorkoutActivity,
  WorkoutActivityState,
} from "../../utils/liveActivity";

export function LiveActivityManager() {
  const {
    currentRoutine,
    currentExerciseIndex,
    exercises,
    timeRemaining,
    isTimerRunning,
    restTime,
  } = useWorkout();

  const activeRef = useRef(false);
  const prevTimeRef = useRef(timeRemaining);

  const compute = (statusOverride?: string): WorkoutActivityState => {
    const ex = exercises.find(
      (e) => e.id === currentRoutine?.exercises[currentExerciseIndex]?.exerciseId,
    );
    const resting = isTimerRunning && timeRemaining > 0;
    return {
      exerciseName: ex?.name ?? currentRoutine?.name ?? "Workout",
      isResting: resting,
      restEndEpochMs: resting ? Date.now() + timeRemaining * 1000 : 0,
      restTotalSec: restTime,
      status: statusOverride ?? (resting ? "Resting" : "In progress"),
    };
  };

  useEffect(() => {
    if (currentRoutine && !activeRef.current) {
      activeRef.current = true;
      startWorkoutActivity(compute());
    } else if (!currentRoutine && activeRef.current) {
      activeRef.current = false;
      endWorkoutActivity();
    }
  }, [currentRoutine]);

  useEffect(() => {
    if (activeRef.current) updateWorkoutActivity(compute());
  }, [currentExerciseIndex, isTimerRunning]);

  useEffect(() => {
    if (activeRef.current) {
      const prev = prevTimeRef.current;
      if (prev > 0 && timeRemaining === 0) {
        updateWorkoutActivity(compute("Rest done"));
      } else if (isTimerRunning && Math.abs(timeRemaining - prev) > 2) {
        updateWorkoutActivity(compute());
      }
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining]);

  return null;
}
