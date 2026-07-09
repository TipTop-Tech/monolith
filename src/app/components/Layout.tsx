import { Outlet, Link, useLocation } from "react-router";
import { Dumbbell, ListTodo, User, CircleUser } from "lucide-react";
import { WorkoutProvider, useWorkout } from "../context/WorkoutContext";
import { GlobalCanvas } from "./3d/GlobalCanvas";
import { ActiveWorkoutBar } from "./ActiveWorkoutBar";

function BottomNav() {
  const location = useLocation();
  const { currentRoutine } = useWorkout();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const isWorkoutActive = !!currentRoutine;

  return (
    <nav className="shrink-0 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] pointer-events-auto">
      <div className="flex justify-around items-center h-20 px-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
            !isWorkoutActive
              ? "text-muted-foreground/30 pointer-events-none"
              : isActive("/") && !isActive("/routines") && !isActive("/body")
              ? "text-primary scale-110"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-disabled={!isWorkoutActive}
        >
          <Dumbbell size={22} className="mb-1" />
          <span className="label-font text-[9px]">WORKOUT</span>
        </Link>
        <Link
          to="/routines"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive("/routines") ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <ListTodo size={22} className="mb-1" />
          <span className="label-font text-[9px]">ROUTINES</span>
        </Link>
        <Link
          to="/body"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive("/body") || isActive("/muscle")
            ? "text-primary scale-110"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <User size={22} className="mb-1" />
          <span className="label-font text-[9px]">BODY</span>
        </Link>
        <Link
          to="/account"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive("/account") ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <CircleUser size={22} className="mb-1" />
          <span className="label-font text-[9px]">ACCOUNT</span>
        </Link>
      </div>
    </nav>
  );
}

export function Layout() {
  return (
    <WorkoutProvider>
      <div className="h-full flex flex-col min-h-0 pt-[env(safe-area-inset-top)]">
        <main className="flex-1 min-h-0 overflow-auto overscroll-none pointer-events-auto">
          <Outlet />
        </main>
        <ActiveWorkoutBar />
        <BottomNav />
      </div>
    </WorkoutProvider>
  );
}
