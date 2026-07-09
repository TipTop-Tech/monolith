import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Dumbbell, ChevronRight, Check } from "lucide-react";
import { useWorkout } from "../context/WorkoutContext";
import { haptics } from "../lib/haptics";
import { pulse } from "../../utils/feedback";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SIZE = 50;
const SW = 3;
const R = (SIZE - SW) / 2;
const CIRC = 2 * Math.PI * R;

function Ring({ fraction, label, done }: { fraction: number; label: string; done?: boolean }) {
  const clamped = done ? 1 : Math.max(0, Math.min(1, fraction));
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        {!done && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            className="text-foreground/15"
            stroke="currentColor"
            strokeWidth={SW}
          />
        )}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          className="text-primary"
          stroke="currentColor"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - clamped)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-primary">
        {done ? (
          <Check size={20} strokeWidth={2.5} />
        ) : (
          <span className="display-font text-base text-foreground tabular-nums">{label}</span>
        )}
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

  const [justDone, setJustDone] = useState(false);
  const prevTimeRef = useRef(timeRemaining);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (prevTimeRef.current > 0 && timeRemaining === 0) {
      setJustDone(true);
      pulse(cardRef.current, "success");
    } else if (timeRemaining > 0) {
      setJustDone(false);
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    if (location.pathname === "/") setJustDone(false);
  }, [location.pathname]);

  if (!currentRoutine || location.pathname === "/") return null;

  const currentExercise = exercises.find(
    (e) => e.id === currentRoutine.exercises[currentExerciseIndex]?.exerciseId,
  );
  const resting = isTimerRunning && timeRemaining > 0;
  const fraction = restTime > 0 ? timeRemaining / restTime : 0;
  const status = resting ? "Resting" : justDone ? "Rest done" : "In progress";

  return (
    <div className="px-3 pb-2 pointer-events-none">
      <button
        ref={cardRef}
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
          <p
            className={`label-font text-[9px] truncate mt-0.5 ${
              justDone ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {status}
          </p>
        </div>
        {resting ? (
          <Ring fraction={fraction} label={formatTime(timeRemaining)} />
        ) : justDone ? (
          <Ring fraction={1} label="" done />
        ) : (
          <ChevronRight size={22} className="text-muted-foreground shrink-0 mr-1" />
        )}
      </button>
    </div>
  );
}
