import { Outlet, Link, useLocation } from "react-router";
import { Dumbbell, ListTodo, User } from "lucide-react";
import { WorkoutProvider } from "../context/WorkoutContext";

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <WorkoutProvider>
      <div className="h-full flex flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <nav className="bg-background/95 backdrop-blur-xl">
          <div className="flex justify-around items-center h-20 px-4">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive("/") && !isActive("/routines") && !isActive("/body")
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Dumbbell size={22} className="mb-1" />
              <span className="label-font text-[9px]">WORKOUT</span>
            </Link>
            <Link
              to="/routines"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive("/routines") ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo size={22} className="mb-1" />
              <span className="label-font text-[9px]">ROUTINES</span>
            </Link>
            <Link
              to="/body"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive("/body") || isActive("/muscle")
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={22} className="mb-1" />
              <span className="label-font text-[9px]">BODY</span>
            </Link>
          </div>
        </nav>
      </div>
    </WorkoutProvider>
  );
}
