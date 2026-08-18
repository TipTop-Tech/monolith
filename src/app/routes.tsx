import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ActiveWorkout } from "./components/active-workout/ActiveWorkout";
import { Routines } from "./components/routines/Routines";
import { WorkoutHistory } from "./components/routines/WorkoutHistory";
import { BodyMap } from "./components/body/BodyMap";
import { MuscleExercises } from "./components/body/MuscleExercises";
import { AuthGuard } from "./components/auth/AuthGuard";
import { SignInPage } from "./components/auth/SignInPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { AccountPage } from "./components/auth/AccountPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { AppearancePage } from "./components/settings/AppearancePage";
import { PremiumGate } from "./components/ui/PremiumGate";

export const router = createBrowserRouter([
  { path: "/signin", Component: SignInPage },
  { path: "/signup", Component: SignUpPage },
  {
    path: "/",
    Component: AuthGuard,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, path: "/", Component: ActiveWorkout },
          { path: "routines", Component: Routines },
          { path: "workout/:exerciseId", Component: WorkoutHistory },
          // { path: "body", element: <PremiumGate showLockOverlay><BodyMap /></PremiumGate> },
          // { path: "muscle/:muscleId", element: <PremiumGate showLockOverlay><MuscleExercises /></PremiumGate> },
          { path: "body", element: <BodyMap /> },
          { path: "muscle/:muscleId", element: <MuscleExercises /> },
          { path: "account", Component: AccountPage },
          { path: "settings", Component: SettingsPage },
          { path: "settings/appearance", Component: AppearancePage },
        ],
      },
    ],
  },
]);
