import { useEffect, useRef, useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { useNavigate } from "react-router";
import { ChevronRight, Plus, Sparkles, Trash2, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { SwipeableRow } from "../ui/SwipeableRow";

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
import { Textarea } from "../ui/textarea";
import { generateRoutineWithAgent, type RoutineAgentResult, type TrainingExperience, type TrainingSex } from "../../lib/routineAgent";

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
  suggestedWeightLbs?: number;
  coachNotes?: string;
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
  suggestedWeightLbs,
  coachNotes,
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

  const subtitle = lastSet
    ? `${lastSet.reps} REPS × ${lastSet.weight} LBS LAST SET`
    : `${sets} SETS × ${targetReps} REPS`;

  return (

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
        <div className="label-font text-muted-foreground mt-1">{subtitle}</div>
        {suggestedWeightLbs ? (
          <div className="label-font text-[10px] tracking-[0.22em] text-muted-foreground/80 mt-1">
            AI START ≈ {suggestedWeightLbs} LBS
          </div>
        ) : null}
        {coachNotes ? (
          <div className="mt-2 max-w-[17rem] text-left text-[11px] leading-4 text-muted-foreground/70">
            {coachNotes}
          </div>
        ) : null}
      </div>
      <ChevronRight size={20} className="text-muted-foreground" />
    </button>
  );
}

export function Routines() {
  const { routines, exercises, addRoutine, removeRoutine, addExerciseToRoutine, removeRoutineExercise, history } = useWorkout();
  const navigate = useNavigate();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const routineRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  // const routineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
  const [isAIRoutineOpen, setIsAIRoutineOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [manualSets, setManualSets] = useState("3");
  const [manualReps, setManualReps] = useState("10");
  const [activeRoutineIndex, setActiveRoutineIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDuration, setAiDuration] = useState("60");
  const [aiBodyWeight, setAiBodyWeight] = useState("");
  const [aiSex, setAiSex] = useState<TrainingSex>("unspecified");
  const [aiExperience, setAiExperience] = useState<TrainingExperience>("beginner");
  const [aiResult, setAiResult] = useState<RoutineAgentResult | null>(null);

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
    setManualSets("3");
    setManualReps("10");
    setIsAddWorkoutOpen(true);
  };

  const scrollToRoutine = (routineIndex: number) => {
    const nextRoutine = routineRefs.current[routineIndex];
    if (!nextRoutine) {
      return;
    }

    nextRoutine.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const sets = Math.max(1, Number.parseInt(manualSets, 10) || 3);
    const targetReps = Math.max(1, Number.parseInt(manualReps, 10) || 10);

    addExerciseToRoutine(selectedRoutineId, {
      exerciseId: selectedExerciseId,
      sets,
      targetReps,
    });

    setIsAddWorkoutOpen(false);
  };

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

  const openAIRoutine = () => {
    setAiResult(null);
    setAiPrompt("");
    setAiDuration("60");
    setAiBodyWeight("");
    setAiSex("unspecified");
    setAiExperience("beginner");
    setIsAIRoutineOpen(true);
  };

  const handleGenerateAIRoutine = (generateAnyway = false) => {
    const duration = Number.parseInt(aiDuration, 10);
    const bodyWeight = Number.parseFloat(aiBodyWeight);
    const result = generateRoutineWithAgent(exercises, {
      prompt: aiPrompt,
      durationMinutes: Number.isFinite(duration) ? duration : null,
      bodyWeightLbs: Number.isFinite(bodyWeight) && bodyWeight > 0 ? bodyWeight : null,
      sex: aiSex,
      experience: aiExperience,
      generateAnyway,
    });

    setAiResult(result);
  };

  const handleAddGeneratedRoutine = () => {
    if (aiResult?.status !== "ready") return;

    addRoutine(aiResult.routine);
    setIsAIRoutineOpen(false);

    requestAnimationFrame(() => {
      scrollToRoutine(routines.length);
    });
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

  const CreateRoutineButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
      <button
        type="button"
        onClick={() => {
          setNewRoutineName("");
          setIsAddRoutineOpen(true);
        }}
        className={`${compact ? "py-3 px-4" : "py-4 px-6"} w-full flex items-center justify-between bg-secondary/75 border border-white/15 backdrop-blur-md bevel-element hover:bg-accent/75 transition-all active:scale-[0.99]`}
      >
        <span className="label-font text-left">MANUAL</span>
        <Plus size={compact ? 16 : 20} className="text-muted-foreground" />
      </button>
      <button
        type="button"
        onClick={openAIRoutine}
        className={`${compact ? "py-3 px-4" : "py-4 px-6"} w-full flex items-center justify-between bg-secondary/75 border border-white/15 backdrop-blur-md bevel-element hover:bg-accent/75 transition-all active:scale-[0.99]`}
      >
        <span className="label-font text-left">AI ROUTINE</span>
        <Sparkles size={compact ? 16 : 20} className="text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <>
      <div className="relative h-full">
        {routines.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8 pb-24">
            <div className="text-center space-y-6 w-full max-w-sm">
              <div className="label-font text-muted-foreground">ROUTINES</div>
              <div className="display-font text-4xl bevel-text">No routines yet</div>
              <div className="label-font text-muted-foreground text-xs tracking-[0.25em]">
                CREATE ONE MANUALLY OR ASK THE AGENT TO BUILD ONE
              </div>
              <CreateRoutineButtons />
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




                        <div className="mb-4">
                          <CreateRoutineButtons compact />
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
          </>
        )}
      </div>

      <Dialog open={isAddRoutineOpen} onOpenChange={setIsAddRoutineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create manual routine</DialogTitle>
            <DialogDescription>Name the routine first, then add exercises from the routine page.</DialogDescription>
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
              Create routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add exercise to routine</DialogTitle>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">SETS</div>
                <Input value={manualSets} onChange={(event) => setManualSets(event.target.value)} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">TARGET REPS</div>
                <Input value={manualReps} onChange={(event) => setManualReps(event.target.value)} inputMode="numeric" />
              </div>
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

      <Dialog open={isAIRoutineOpen} onOpenChange={setIsAIRoutineOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create routine with agent</DialogTitle>
            <DialogDescription>
              Describe the workout. If the prompt is vague, the agent will ask for detail or let you generate anyway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="label-font text-xs text-muted-foreground">PROMPT</div>
              <Textarea
                value={aiPrompt}
                onChange={(event) => {
                  setAiPrompt(event.target.value);
                  setAiResult(null);
                }}
                placeholder="Make me a 1 hour upper body workout. I am a distance freestyle swimmer, sore from yesterday, and I do not want to lift too heavy."
                className="min-h-28"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">TIME</div>
                <Select value={aiDuration} onValueChange={setAiDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="75">75 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">BODY WEIGHT</div>
                <Input
                  value={aiBodyWeight}
                  onChange={(event) => setAiBodyWeight(event.target.value)}
                  placeholder="lbs"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">SEX</div>
                <Select value={aiSex} onValueChange={(value) => setAiSex(value as TrainingSex)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">Unspecified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="label-font text-xs text-muted-foreground">EXPERIENCE</div>
                <Select value={aiExperience} onValueChange={(value) => setAiExperience(value as TrainingExperience)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {aiResult?.status === "needs_clarification" ? (
              <div className="rounded-2xl border border-border bg-secondary/45 p-4 space-y-3">
                <div className="label-font text-xs text-muted-foreground">AGENT NEEDS MORE DETAIL</div>
                <p className="text-sm text-muted-foreground">{aiResult.message}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {aiResult.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
                <Button variant="outline" onClick={() => handleGenerateAIRoutine(true)}>
                  Generate anyway
                </Button>
              </div>
            ) : null}

            {aiResult?.status === "ready" ? (
              <div className="rounded-2xl border border-border bg-secondary/45 p-4 space-y-4">
                <div>
                  <div className="label-font text-xs text-muted-foreground mb-2">PREVIEW</div>
                  <div className="display-font text-2xl bevel-text">{aiResult.routine.name}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{aiResult.summary}</p>
                </div>

                <div className="space-y-2">
                  {aiResult.routine.exercises.map((routineExercise, index) => {
                    const exercise = exercises.find((entry) => entry.id === routineExercise.exerciseId);
                    return (
                      <div key={`${routineExercise.exerciseId}-${index}`} className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="text-sm font-medium">{exercise?.name ?? "Unknown Exercise"}</div>
                          <div className="text-xs text-muted-foreground">
                            {routineExercise.sets} × {routineExercise.targetReps}
                            {routineExercise.suggestedWeightLbs ? ` • start ≈ ${routineExercise.suggestedWeightLbs} lb` : " • bodyweight/light load"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  {aiResult.assumptions.map((assumption) => (
                    <div key={assumption} className="text-xs text-muted-foreground">• {assumption}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIRoutineOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleGenerateAIRoutine(false)}>
              Generate preview
            </Button>
            <Button onClick={handleAddGeneratedRoutine} disabled={aiResult?.status !== "ready"}>
              Add routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
