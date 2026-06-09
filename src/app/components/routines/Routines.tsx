import { useEffect, useRef, useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronRight, ChevronUp, MoreVertical, Plus, Trash2 } from "lucide-react";
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

import { SwipeableRow } from "../ui/SwipeableRow";

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
  return (
    /**
     * Component for a row that is clickable and has a swipeable delete functionality
     * 
     * Props:
     *  - exerciseName: string
     *  - sets: number
     *  - targetReps: number
     *  - lastSet: { reps: number, weight: number } | null
     *  - onOpen: () => void
     *  - onRemove: () => void
     */
    <SwipeableRow
      onRemove={onRemove}
      onClick={onOpen}
      className="flex items-center justify-between py-4 px-6 bg-secondary bevel-element"
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
    </SwipeableRow>
  );
}

export function Routines() {
  const { routines, exercises, addRoutine, removeRoutine, addExerciseToRoutine, removeRoutineExercise, history } = useWorkout();
  const navigate = useNavigate();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const routineRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});
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

    /**
     * This code block runs after the routine has been added to the state.
     * 
     * Why? 
     *  - We need the updated list of exercises to calculate the target page index
     *  - We use requestAnimationFrame and setTimeout to ensure 
     *    that the state has been updated before calculating the target page index
     */
    const routine = routines.find(r => r.id === selectedRoutineId);
    if (routine) {
      const newLength = routine.exercises.length + 1;
      const targetPageIndex = Math.floor((newLength - 1) / 5);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const node = sectionRefs.current[`${selectedRoutineId}-page-${targetPageIndex}`];
          if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      });
    }
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

        /**
         * This code block updates the active routine index based on the 
         * currently visible section.
         */
        const routineIndexAttr = visibleEntry.target.getAttribute("data-routine-index");
        if (routineIndexAttr !== null) {
          setActiveRoutineIndex(Number(routineIndexAttr));
        }
      },
      {
        root: scrollRootRef.current,
        threshold: [0.35, 0.5, 0.65, 0.8],
      }
    );

    /**
     * When a page is scrolled into view, it is added to the observer.
     */
    Object.values(sectionRefs.current).forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [routines]);

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
              {
                /**
                 * routines.flatMap iterates through all the routines
                 * For each routine, it splits it into pages of 5 exercises
                 * If a routine has no exercises, it creates a single page with no exercises
                 */
              }
              {routines.flatMap((routine, routineIndex) => {
                const pages = [];
                for (let i = 0; i < routine.exercises.length; i += 5) {
                  pages.push(routine.exercises.slice(i, i + 5));
                }
                if (pages.length === 0) pages.push([]);
                /**
                 * This maps the pages array into section componenets containing at most 
                 * five exercises
                 */
                return pages.map((pageExercises, pageIndex) => {
                  const globalIndexOffset = pageIndex * 5;
                  const isLastRoutine = routineIndex === routines.length - 1;
                  const isLastPage = pageIndex === pages.length - 1;

                  return (
                    <section
                      key={`${routine.id}-page-${pageIndex}`}
                      ref={(node) => {
                        if (node) {
                          sectionRefs.current[`${routine.id}-page-${pageIndex}`] = node;
                          if (pageIndex === 0) {
                            routineRefs.current[routineIndex] = node;
                          }
                        }
                      }}
                      data-routine-index={routineIndex}
                      data-page-index={pageIndex}
                      className="relative h-full min-h-full snap-start px-6 py-8 md:px-8"
                    >
                      <div className="flex h-full min-h-full flex-col">
                        <div className="mb-6 flex items-end gap-4">
                          <div>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="label-font text-muted-foreground">
                                ROUTINE {String(routineIndex + 1).padStart(2, "0")} / {String(routines.length).padStart(2, "0")}
                              </div>
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

                        {pageIndex === 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoutine(routine.id, routine.name)}
                            aria-label={`Remove ${routine.name}`}
                            className="absolute right-6 top-8 h-10 w-10 flex items-center justify-center bg-secondary/75 bevel-element hover:bg-accent/75 transition-all active:scale-[0.98] md:right-8"
                          >
                            <Trash2 size={18} className="text-destructive" />
                          </button>
                        )}

                        <div className="space-y-3">
                          {pageExercises.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/60 px-6 py-5 label-font text-xs tracking-[0.25em] text-muted-foreground">
                              NO WORKOUTS IN THIS ROUTINE
                            </div>
                          ) : (
                            pageExercises.map((routineExercise, localIndex) => {
                              const globalIndex = globalIndexOffset + localIndex;
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
                                  key={`${routine.id}-${routineExercise.exerciseId}-${globalIndex}`}
                                  exerciseName={exercise?.name ?? "Unknown Exercise"}
                                  sets={routineExercise.sets}
                                  targetReps={routineExercise.targetReps}
                                  lastSet={lastSet}
                                  onOpen={() => navigate(`/workout/${routineExercise.exerciseId}`)}
                                  onRemove={() => removeRoutineExercise(routine.id, globalIndex)}
                                />
                              );
                            })
                          )}
                        </div>

                        {isLastPage && routine.exercises.length < 10 && (
                          <div className={isLastRoutine && isLastPage ? "mt-3 mb-28 space-y-3" : "mt-3 space-y-3"}>
                            <button
                              type="button"
                              onClick={() => openAddWorkout(routine.id)}
                              className="relative z-10 w-full flex items-center justify-between py-4 px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-[0.99]"
                            >
                              <span className="label-font text-left">ADD WORKOUT</span>
                              <Plus size={20} className="text-muted-foreground" />
                            </button>
                          </div>
                        )}
                        {/* Ensure scrolling space for bottom button */}
                        {isLastPage && routine.exercises.length >= 10 && isLastRoutine && (
                          <div className="mt-3 mb-28" />
                        )}
                        {!isLastPage && (
                          <div className="flex justify-center mt-auto py-2">
                            <MoreVertical size={24} className="text-muted-foreground animate-bounce" />
                          </div>
                        )}
                      </div>

                      {isLastRoutine && isLastPage && (
                        <div className="pointer-events-none absolute inset-x-6 bottom-3 z-20 md:inset-x-8">
                          <button
                            type="button"
                            onClick={() => setIsAddRoutineOpen(true)}
                            className="pointer-events-auto w-full py-4 px-6 bg-secondary/65 border border-white/15 backdrop-blur-md bevel-element hover:bg-accent/70 transition-all active:scale-[0.99]"
                          >
                            <span className="label-font text-left">ADD ROUTINE</span>
                          </button>
                        </div>
                      )}
                    </section>
                  );
                });
              })}
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