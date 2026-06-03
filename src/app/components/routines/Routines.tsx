import { useEffect, useRef, useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

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
        <ChevronRight size={20} className="text-muted-foregrouund" />
      </button>
    </div>
  );
}

export function Routines() {
  const { routines, exercises, addRoutine, removeRoutine, addExerciseToRoutine, removeRoutineExercise, history } = useWorkout();
  const navigate = useNavigate();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const routineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("/")
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("/");
  const [activeRoutineIndex, setActiveRoutineIndex] = useState(0);

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

  const scrollToRoutine = (routineIndex: number) => {
    const nextRoutine = routineRefs.current[routineIndex];
    if (!nextRoutine) {
      return;
    }

    nextRoutine.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveRoutine = (direction: -1 | 1) => {
    const nextIndex = activeRoutineIndex + direction;
    if (nextIndex < 0 || nextIndex >= routines.length) {
      return;
    }

    scrollToRoutine(nextIndex);
  };

  const handleCreateRoutine = () => {
    const trimmedName = newRoutineName.trim();
    if (!trimmedName) {
      return;
    }

    const routineId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    addRoutine({
      id: routineId,
      name: trimmedName,
      exercises: [],
    });

    setIsAddRoutineOpen(false);
    setNewRoutineName("");

    requestAnimationFrame(() => {
      scrollToRoutine(routines.length);
    });
  };

  const handleRemoveRoutine = (routineId: string, routineName: string) => {
    const confirmed = window.confirm(`Delete routine \"${routineName}\"?`);
    if (!confirmed) {
      return;
    }

    removeRoutine(routineId);
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

  useEffect(() => {
    if (!scrollRootRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const index = routineRefs.current.findIndex((node) => node === visibleEntry.target);
        if (index >= 0) {
          setActiveRoutineIndex(index);
        }
      },
      {
        root: scrollRootRef.current,
        threshold: [0.35, 0.5, 0.65, 0.8],
      }
    );

    routineRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [routines.length]);

  useEffect(() => {
    if (routines.length === 0 && activeRoutineIndex !== 0) {
      setActiveRoutineIndex(0);
      return;
    }

    if (activeRoutineIndex > routines.length - 1) {
      setActiveRoutineIndex(routines.length - 1);
    }
  }, [activeRoutineIndex, routines.length]);

  return (
    <>
      <div className="relative h-full">
        {routines.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8 pb-24">
            <div className="text-center space-y-4">
              <div className="label-font text-muted-foreground">ROUTINES</div>
              <div className="display-font text-4xl bevel-text">No routines yet</div>
              <div className="label-font text-muted-foreground text-xs tracking-[0.25em]">
                CREATE A ROUTINE TO START BUILDING YOUR TRAINING FLOW
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={scrollRootRef}
              className="h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory hide-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {routines.map((routine, routineIndex) => (
                <section
                  key={routine.id}
                  ref={(node) => {
                    routineRefs.current[routineIndex] = node;
                  }}
                  className="relative h-full min-h-full snap-start px-6 py-8 md:px-8"
                >
                  <div className="flex h-full min-h-full flex-col">
                    <div className="mb-6 flex items-end gap-4">
                      <div>
                        <div className="label-font text-muted-foreground mb-3">
                          ROUTINE {String(routineIndex + 1).padStart(2, "0")} / {String(routines.length).padStart(2, "0")}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/routines/${routine.id}`)}
                          className="group flex items-center gap-3 text-left"
                        >
                          <div className="display-font text-4xl md:text-5xl bevel-text">{routine.name}</div>
                          <ChevronRight size={20} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRoutine(routine.id, routine.name)}
                      aria-label={`Remove ${routine.name}`}
                      className="absolute right-6 top-8 h-10 w-10 flex items-center justify-center bg-secondary/75 bevel-element hover:bg-accent/75 transition-all active:scale-[0.98] md:right-8"
                    >
                      <Trash2 size={18} className="text-destructive" />
                    </button>

                    <div className="space-y-3">
                      {routine.exercises.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/60 px-6 py-5 label-font text-xs tracking-[0.25em] text-muted-foreground">
                          NO WORKOUTS IN THIS ROUTINE
                        </div>
                      ) : (
                        routine.exercises.map((routineExercise, index) => {
                          const exercise = exercises.find((e) => e.id === routineExercise.exerciseId);
                          const exerciseHistory = history.find(
                            (h) => h.exerciseId === routineExercise.exerciseId
                          );
                          const lastSet =
                            exerciseHistory && exerciseHistory.sets.length > 0
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
                    </div>

                    <div className={routineIndex === routines.length - 1 ? "mt-3 mb-28 space-y-3" : "mt-3 space-y-3"}>
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

                  {routineIndex === routines.length - 1 ? (
                    <div className="pointer-events-none absolute inset-x-6 bottom-3 z-20 md:inset-x-8">
                      <button
                        type="button"
                        onClick={() => setIsAddRoutineOpen(true)}
                        className="pointer-events-auto w-full py-4 px-6 bg-secondary/65 border border-white/15 backdrop-blur-md bevel-element hover:bg-accent/70 transition-all active:scale-[0.99]"
                      >
                        <span className="label-font text-left">ADD ROUTINE</span>
                      </button>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            {/*
            <div className="pointer-events-none absolute inset-0 z-20">
              <button
                type="button"
                onClick={() => moveRoutine(-1)}
                disabled={activeRoutineIndex === 0}
                className="pointer-events-auto absolute right-6 top-3 w-10 h-10 flex items-center justify-center bg-secondary/35 border border-white/15 backdrop-blur-md bevel-element shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all hover:bg-secondary/45 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed md:right-8"
                aria-label="Go to previous routine"
              >
                <ChevronUp size={18} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => moveRoutine(1)}
                disabled={activeRoutineIndex === routines.length - 1}
                className="pointer-events-auto absolute bottom-3 right-6 w-10 h-10 flex items-center justify-center bg-secondary/35 border border-white/15 backdrop-blur-md bevel-element shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all hover:bg-secondary/45 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed md:right-8"
                aria-label="Go to next routine"
              >
                <ChevronDown size={18} className="text-muted-foreground" />
              </button>
            </div>
            */}
          </>
        )}

        {routines.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 px-6 md:px-8">
            <button
              type="button"
              onClick={() => setIsAddRoutineOpen(true)}
              className="pointer-events-auto w-[calc(100%-4rem)] py-4 px-6 bg-secondary/65 border border-white/15 backdrop-blur-md bevel-element hover:bg-accent/70 transition-all active:scale-[0.99]"
            >
              <span className="label-font text-left">ADD ROUTINE</span>
            </button>
          </div>
        ) : null}
      </div>

      <Dialog open={isAddRoutineOpen} onOpenChange={setIsAddRoutineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add routine</DialogTitle>
            <DialogDescription>Give your new routine a name.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="label-font text-xs text-muted-foreground">ROUTINE NAME</div>
            <Input
              value={newRoutineName}
              onChange={(event) => setNewRoutineName(event.target.value)}
              placeholder="e.g. Full Body A"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoutineOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoutine} disabled={!newRoutineName.trim()}>
              Add routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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