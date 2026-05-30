import { useRef, useState } from "react";
import { useWorkout } from "../context/WorkoutContext";
import { useNavigate } from "react-router";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const BODY_PARTS = [
  { key: "chest", label: "Chest" },
  { key: "front-deltoids", label: "Front Deltoids" },
  { key: "back-deltoids", label: "Back Deltoids" },
  { key: "biceps", label: "Biceps" },
  { key: "triceps", label: "Triceps" },
  { key: "mid-back", label: "Mid Back" },
  { key: "lower-back", label: "Lower Back" },
  { key: "abs", label: "Abs" },
  { key: "obliques", label: "Obliques" },
  { key: "quadriceps", label: "Quadriceps" },
  { key: "hamstring", label: "Hamstrings" },
  { key: "gluteal", label: "Glutes" },
  { key: "calves", label: "Calves" },
  { key: "adductor", label: "Adductors" },
  { key: "abductors", label: "Abductors" },
  { key: "forearm", label: "Forearms" },
  { key: "head", label: "Head" },
  { key: "neck", label: "Neck" },
] as const;

const BODY_PART_ORDER_INDEX = new Map(
  BODY_PARTS.map((part, index) => [part.key, index])
);

function getExerciseSortRank(exerciseMuscleGroups: string[]) {
  const firstMappedGroup = exerciseMuscleGroups.reduce<number | null>(
    (bestRank, muscleGroup) => {
      const rank = BODY_PART_ORDER_INDEX.get(muscleGroup) ?? null;
      if (rank === null) {
        return bestRank;
      }

      return bestRank === null ? rank : Math.min(bestRank, rank);
    },
    null
  );

  return firstMappedGroup ?? Number.POSITIVE_INFINITY;
}

function getPrimaryBodyPart(exerciseMuscleGroups: string[]) {
  const rankedGroups = exerciseMuscleGroups
    .map((muscleGroup) => ({
      muscleGroup,
      rank: BODY_PART_ORDER_INDEX.get(muscleGroup),
    }))
    .filter(
      (entry): entry is { muscleGroup: string; rank: number } => entry.rank !== undefined
    )
    .sort((left, right) => left.rank - right.rank);

  return rankedGroups[0]?.muscleGroup ?? null;
}

type RoutineExerciseRowProps = {
  exerciseName: string;
  sets: number;
  targetReps: number;
  lastSet?: {
    reps: number;
    weight: number;
  } | null;
  onOpen: () => void;
  onRemove: () => void;
};

function RoutineExerciseRow({
  exerciseName,
  sets,
  targetReps,
  lastSet = null,
  onOpen,
  onRemove,
}: RoutineExerciseRowProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipeOffsetRef = useRef(0);
  const blockNextClickRef = useRef(false);

  const resetSwipe = () => {
    touchStartX.current = null;
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    touchStartX.current = event.touches[0].clientX;
    blockNextClickRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (touchStartX.current === null) return;

    const deltaX = event.touches[0].clientX - touchStartX.current;
    const nextOffset = deltaX < 0 ? Math.max(deltaX, -160) : 0;

    swipeOffsetRef.current = nextOffset;
    setSwipeOffset(nextOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (swipeOffsetRef.current < -90) {
      blockNextClickRef.current = true;
      onRemove();
      return;
    }

    resetSwipe();
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-end gap-2 bg-secondary/95 pr-6 text-muted-foreground">
        <Trash2 size={18} className="text-destructive" />
        <span className="label-font text-[10px] tracking-[0.3em]">REMOVE</span>
      </div>
      <button
        type="button"
        onClick={() => {
          if (blockNextClickRef.current) {
            blockNextClickRef.current = false;
            return;
          }

          onOpen();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetSwipe}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 180ms ease",
          touchAction: "pan-y",
          WebkitTapHighlightColor: "transparent",
        }}
        className="relative z-10 w-full flex items-center justify-between py-4 px-6 bg-secondary bevel-element outline-none transition-all hover:bg-accent active:scale-[0.99] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <div className="text-left">
          <div className="display-font text-xl bevel-text">{exerciseName}</div>
          <div className="label-font text-muted-foreground mt-1">
            {lastSet
              ? `${lastSet.reps} REPS × ${lastSet.weight} lbs`
              : `${sets} SETS × ${targetReps} REPS`}
          </div>
        </div>
        <ChevronRight size={20} className="text-muted-foreground" />
      </button>
    </div>
  );
}

export function Routines() {
  const { routines, exercises, addExerciseToRoutine, removeRoutineExercise, history } = useWorkout();
  const navigate = useNavigate();
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId) ?? null;
  const sortedExercises = [...exercises].sort((leftExercise, rightExercise) => {
    const leftRank = getExerciseSortRank(leftExercise.muscleGroups);
    const rightRank = getExerciseSortRank(rightExercise.muscleGroups);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return leftExercise.name.localeCompare(rightExercise.name);
  });
  const groupedExercises = BODY_PARTS.map((bodyPart) => ({
    ...bodyPart,
    exercises: sortedExercises.filter(
      (exercise) => getPrimaryBodyPart(exercise.muscleGroups) === bodyPart.key
    ),
  })).filter((group) => group.exercises.length > 0);
  const otherExercises = sortedExercises.filter(
    (exercise) => getPrimaryBodyPart(exercise.muscleGroups) === null
  );

  const openAddWorkout = (routineId: string) => {
    setSelectedRoutineId(routineId);
    setSelectedExerciseId("");
    setIsAddWorkoutOpen(true);
  };

  const handleAddWorkout = () => {
    if (!selectedRoutineId || !selectedExerciseId) return;

    addExerciseToRoutine(selectedRoutineId, {
      exerciseId: selectedExerciseId,
      sets: 3,
      targetReps: 10,
    });

    setIsAddWorkoutOpen(false);
  };

  return (
    <>
      <div className="h-full overflow-auto p-8">
        <div className="label-font text-muted-foreground mb-12">ROUTINES</div>
        <div className="space-y-12">
          {routines.map((routine) => (
            <div key={routine.id}>
              <div className="mb-6 space-y-4">
                <div className="display-font text-4xl bevel-text">{routine.name}</div>
              </div>
              <div className="space-y-3">
                {routine.exercises.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 px-6 py-5 label-font text-xs tracking-[0.25em] text-muted-foreground">
                    NO WORKOUTS IN THIS ROUTINE
                  </div>
                ) : (
                  routine.exercises.map((routineExercise, index) => {
                    const exercise = exercises.find(
                      (e) => e.id === routineExercise.exerciseId
                    );

                      const exerciseHistory = history.find(
                        (h) => h.exerciseId === routineExercise.exerciseId
                      );
                      const lastSet = exerciseHistory && exerciseHistory.sets.length > 0
                        ? exerciseHistory.sets[exerciseHistory.sets.length - 1]
                        : null;

                      return (
                        <RoutineExerciseRow
                          key={`${routine.id}-${routineExercise.exerciseId}-${index}`}
                          exerciseName={exercise?.name ?? "Unknown Exercise"}
                          sets={routineExercise.sets}
                          targetReps={routineExercise.targetReps}
                          lastSet={lastSet}
                          onOpen={() => navigate(`/workout/${routineExercise.exerciseId}`)}
                          onRemove={() => removeRoutineExercise(routine.id, index)}
                        />
                      );
                  })
                )}
                <button
                  type="button"
                  onClick={() => openAddWorkout(routine.id)}
                  className="relative z-10 w-full flex items-center justify-between py-4 px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-[0.99]"
                >
                  <span className="label-font text-left">ADD WORKOUT</span>
                  <Plus size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add workout to routine</DialogTitle>
            <DialogDescription>
              {selectedRoutine ? `Add a new exercise to ${selectedRoutine.name}.` : "Choose an exercise to add."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="label-font text-xs text-muted-foreground">EXERCISE</div>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {groupedExercises.map((group) => (
                    <SelectGroup key={group.key}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {otherExercises.length > 0 ? (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        {otherExercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWorkoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkout} disabled={!selectedExerciseId}>
              Add to routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
