import { useLocation, useParams, useNavigate } from "react-router";
import { useQuery } from "@powersync/react";
import { useWorkout } from "../../context/WorkoutContext";
import { ArrowLeft, ChevronRight } from "lucide-react";

export function MuscleExercises() {
  const { muscleId } = useParams<{ muscleId: string }>();
  const { exercises } = useWorkout();
  const navigate = useNavigate();
  const location = useLocation();
  const view =
    location.state &&
    typeof location.state === "object" &&
    "view" in location.state &&
    location.state.view === "back"
      ? "back"
      : "front";

  const muscleExercises = exercises.filter((exercise) =>
    exercise.muscleGroups.includes(muscleId || "")
  );

  const muscleName = muscleId
    ? muscleId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : "";

  const { data: workoutHistoryRows } = useQuery(
    "SELECT * FROM workoutHistory ORDER BY date ASC"
  );

  const workoutDaysLastWeek = (() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const days = new Set<string>();

    (workoutHistoryRows ?? []).forEach((entry) => {
      const exercise = exercises.find((item) => item.id === entry.exerciseId);
      if (!exercise?.muscleGroups.includes(muscleId || "")) return;

      const entryTime = new Date(entry.date).getTime();
      if (entryTime < oneWeekAgo) return;

      days.add(new Date(entryTime).toISOString().slice(0, 10));
    });

    return days.size;
  })();

  return (
    <div className="h-full overflow-auto p-8">
      <button
        onClick={() => navigate("/body", { state: { view } })}
        className="flex items-center gap-3 mb-12 px-4 py-2 black-glass-button w-fit"
      >
        <ArrowLeft size={20} className="black-glass-text" />
        <span className="label-font black-glass-text">BACK</span>
      </button>

      <div className="display-font text-5xl bevel-text-large mb-2">{muscleName}</div>
      <div className="label-font text-muted-foreground mb-8">
        Exercised {workoutDaysLastWeek} day{workoutDaysLastWeek === 1 ? "" : "s"} in the last week
      </div>

      {muscleExercises.length === 0 ? (
        <div className="text-center label-font text-muted-foreground mt-20">
          NO EXERCISES FOUND
        </div>
      ) : (
        <div className="space-y-4">
          {muscleExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => navigate(`/workout/${exercise.id}`)}
              className="w-full flex items-center justify-between py-5 px-6 black-glass-button transition-all"
            >
              <div className="text-left">
                <div className="display-font text-2xl black-glass-text">{exercise.name}</div>
                <div className="label-font mt-1 black-glass-text opacity-80">
                  {exercise.muscleGroups.join(" · ")}
                </div>
              </div>
              <ChevronRight size={20} className="black-glass-text opacity-80" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}