import { useLocation, useNavigate } from "react-router";
import { Dumbbell, ChevronRight } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { haptics } from "../lib/haptics";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RingCountdown({ fraction, label }: { fraction: number; label: string }) {
  const size = 50;
  const sw = 3;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, fraction));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="text-foreground/15"
          stroke="currentColor"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="text-primary"
          stroke="currentColor"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center display-font text-base text-foreground tabular-nums">
        {label}
      </span>
    </div>
  );
}

export function ActiveWorkoutBar() {
  const {
    currentRoutine,
    currentExerciseIndex,
    exercises,
    timeRemaining,
    isTimerRunning,
    restTime,
  } = useWorkout();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentRoutine || location.pathname === "/") return null;

  const currentExercise = exercises.find(
    (e) => e.id === currentRoutine.exercises[currentExerciseIndex]?.exerciseId,
  );
  const resting = isTimerRunning && timeRemaining > 0;
  const fraction = restTime > 0 ? timeRemaining / restTime : 0;

  return (
    <div className="px-3 pb-2 pointer-events-none">
      <button
        onClick={() => {
          haptics.tap();
          navigate("/");
        }}
        className="pointer-events-auto w-full flex items-center gap-3 rounded-2xl bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-lg pl-3 pr-2.5 py-2 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <Dumbbell size={18} className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="label-font text-foreground truncate">
            {currentExercise?.name ?? currentRoutine.name}
          </p>
          <p className="label-font text-[9px] text-muted-foreground truncate mt-0.5">
            {resting ? "Resting" : "In progress"}
          </p>
        </div>
        {resting ? (
          <RingCountdown fraction={fraction} label={formatTime(timeRemaining)} />
        ) : (
          <ChevronRight size={22} className="text-muted-foreground shrink-0 mr-1" />
        )}
      </button>
    </div>
  );
}
