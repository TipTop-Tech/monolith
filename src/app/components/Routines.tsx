import { useWorkout } from "../context/WorkoutContext";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";

export function Routines() {
  const { routines, exercises } = useWorkout();
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-auto p-8">
      <div className="label-font text-muted-foreground mb-12">ROUTINES</div>
      <div className="space-y-12">
        {routines.map((routine) => (
          <div key={routine.id}>
            <div className="display-font text-4xl bevel-text mb-6">{routine.name}</div>
            <div className="space-y-3">
              {routine.exercises.map((routineExercise) => {
                const exercise = exercises.find(
                  (e) => e.id === routineExercise.exerciseId
                );
                return (
                  <button
                    key={routineExercise.exerciseId}
                    onClick={() => navigate(`/workout/${routineExercise.exerciseId}`)}
                    className="w-full flex items-center justify-between py-4 px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-[0.99]"
                  >
                    <div className="text-left">
                      <div className="display-font text-xl bevel-text">{exercise?.name}</div>
                      <div className="label-font text-muted-foreground mt-1">
                        {routineExercise.sets} SETS × {routineExercise.targetReps} REPS
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
