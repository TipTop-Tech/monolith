import { useParams, useNavigate } from "react-router";
import { useWorkout } from "../context/WorkoutContext";
import { ArrowLeft, ChevronRight } from "lucide-react";

export function MuscleExercises() {
  const { muscleId } = useParams<{ muscleId: string }>();
  const { exercises } = useWorkout();
  const navigate = useNavigate();

  const muscleExercises = exercises.filter((exercise) =>
    exercise.muscleGroups.includes(muscleId || "")
  );

  const muscleName = muscleId
    ? muscleId.charAt(0).toUpperCase() + muscleId.slice(1)
    : "";

  return (
    <div className="h-full overflow-auto p-8">
      <button
        onClick={() => navigate("/body")}
        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft size={20} />
        <span className="label-font">BACK</span>
      </button>

      <div className="display-font text-5xl bevel-text-large mb-2">{muscleName}</div>
      <div className="label-font text-muted-foreground mb-16">EXERCISES</div>

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
              className="w-full flex items-center justify-between py-5 px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-[0.99]"
            >
              <div className="text-left">
                <div className="display-font text-2xl bevel-text">{exercise.name}</div>
                <div className="label-font text-muted-foreground mt-1">
                  {exercise.muscleGroups.join(" · ")}
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
