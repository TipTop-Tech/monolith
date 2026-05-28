import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ActiveWorkout } from "./components/ActiveWorkout";
import { Routines } from "./components/Routines";
import { WorkoutHistory } from "./components/WorkoutHistory";
import { BodyMap } from "./components/BodyMap";
import { MuscleExercises } from "./components/MuscleExercises";

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
