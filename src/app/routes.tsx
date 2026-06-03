import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ActiveWorkout } from "./components/active-workout/ActiveWorkout";
import { Routines } from "./components/routines/Routines";
import { WorkoutHistory } from "./components/routines/WorkoutHistory";
import { BodyMap } from "./components/body/BodyMap";
import { MuscleExercises } from "./components/body/MuscleExercises";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, path: "/", Component: ActiveWorkout },
      { path: "routines", Component: Routines },
      { path: "workout/:exerciseId", Component: WorkoutHistory },
      { path: "body", Component: BodyMap },
      { path: "muscle/:muscleId", Component: MuscleExercises },
    ],
  },
]);
