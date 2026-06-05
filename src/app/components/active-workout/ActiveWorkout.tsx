import { useState, useEffect, useRef } from "react";
import { useStorageWarning } from "../../hooks/useStorageWarning";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { useWorkout } from "../../context/WorkoutContext";
import { useNavigate, useLocation } from "react-router";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
// react-slick has no bundled TypeScript declarations; ignore the missing types here
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: module has no type declarations
import Slider from "react-slick";
import { ScrollPicker } from "./ScrollPicker";

export function ActiveWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentRoutine,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    exercises,
    addSet,
    routines,
    setCurrentRoutine,
    history,
  } = useWorkout();

  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [restTime, setRestTime] = useState(90);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pickerType, setPickerType] = useState<"reps" | "weight" | null>(null);
  const [workoutSessionStartedAt, setWorkoutSessionStartedAt] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [currentView, setCurrentView] = useState(1);

  const { showWarning, storageStatus, checkStorage, dismissWarning } = useStorageWarning();

  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      sliderRef.current?.slickGoTo(1);
      setCurrentSlide(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentRoutine, currentExerciseIndex]);

  const currentExercise = currentRoutine
    ? exercises.find(
      (e) => e.id === currentRoutine.exercises[currentExerciseIndex]?.exerciseId
    )
    : null;

  const currentExerciseHistory = currentExercise
    ? history.find((h) => h.exerciseId === currentExercise.id)
    : null;

  const visibleSets = currentExerciseHistory?.sets.filter((set) => {
    const setDate = new Date(set.date).toDateString();
    const today = new Date().toDateString();
    const startedAfterWorkoutBegan =
      workoutSessionStartedAt === null || new Date(set.date).getTime() >= workoutSessionStartedAt;
    return setDate === today && startedAfterWorkoutBegan;
  }) || [];

  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  const handleSelectRoutine = (routine: (typeof routines)[number]) => {
    // open picker locally when selecting a routine from this screen
    setPickerType(null);
    setSelectedRoutineId(routine.id);
    setCurrentView(2);
  };

  const handleSelectExercise = (routine: (typeof routines)[number], exerciseIndex: number) => {
    setCurrentRoutine(routine);
    setCurrentExerciseIndex(exerciseIndex);
    setWorkoutSessionStartedAt(Date.now());
    setReps(0);
    setWeight(0);
    setRestTime(90);
    setTimeRemaining(0);
    setIsTimerRunning(false);
    setPickerType(null);
    // setSelectedRoutineId(null);
    setCurrentView(3);
  };
  useEffect(() => {
    const state = (location as any).state as { openRoutineId?: string } | undefined;
    if (state?.openRoutineId) {
      setSelectedRoutineId(state.openRoutineId);
      // remove navigation state
      navigate("/", { replace: true });
    }
  }, [location]);

  const handleLogSet = () => {
    if (!currentExercise || reps === 0 || weight === 0) return;

    addSet(currentExercise.id, reps, weight);
    setReps(0);
    setWeight(0);
    setTimeRemaining(restTime);
    setIsTimerRunning(true);

    setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(1);
      }
    }, 100);
    // Checks to see if storage >= 150mb
    checkStorage();
  };

  const handleEndWorkout = () => {
    setCurrentRoutine(null);
    setWorkoutSessionStartedAt(null);
    setReps(0);
    setWeight(0);
    setTimeRemaining(0);
    setIsTimerRunning(false);
    setPickerType(null);
    setCurrentSlide(1);
  };

  const handleEndExercise = () => {

    setWorkoutSessionStartedAt(null);
    setReps(0);
    setWeight(0);
    setTimeRemaining(0);
    setIsTimerRunning(false);
    setPickerType(null);
    setCurrentView(2);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeRemaining > 0 ? (timeRemaining / restTime) * 100 : 0;

  // Choose which exercise you want to choose from the routine (View 2)
  if (currentView == 2) {

    const pickerRoutine = routines.find((r) => r.id === selectedRoutineId) ?? null;
    if (!pickerRoutine) return null;
    else {
      return (
        <div className="h-full overflow-auto p-8 pb-28">
          <button
            onClick={() => {
              setSelectedRoutineId(null);
              setCurrentView(1);
            }}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <span className="label-font">BACK</span>
          </button>

          <div className="label-font text-muted-foreground mb-4">SELECT EXERCISE</div>
          <div className="display-font text-5xl bevel-text-large mb-3">{pickerRoutine.name}</div>
          <div className="label-font text-muted-foreground mb-12">CHOOSE THE EXERCISE YOU WANT TO START WITH</div>

          {pickerRoutine.exercises.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 px-6 py-8 label-font text-xs tracking-[0.25em] text-muted-foreground">
              NO EXERCISES IN THIS ROUTINE
            </div>
          ) : (
            <div className="space-y-4">
              {pickerRoutine.exercises.map((routineExercise, index) => {
                const exercise = exercises.find((e) => e.id === routineExercise.exerciseId);
                return (
                  <button
                    key={`${pickerRoutine.id}-${routineExercise.exerciseId}-${index}`}
                    type="button"
                    onClick={() => {
                      handleSelectExercise(pickerRoutine, index);
                    }}
                    className="w-full flex items-center justify-between gap-6 py-5 px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-[0.99]"
                  >
                    <div className="text-left">
                      <div className="display-font text-2xl bevel-text">{exercise?.name ?? "Unknown Exercise"}</div>
                      <div className="label-font text-muted-foreground mt-1">{routineExercise.sets} SETS × {routineExercise.targetReps} REPS</div>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="label-font text-[10px] tracking-[0.3em]">START</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  }


  // Choose Routine for Active Workout (View 1)
  if (currentView == 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="label-font text-muted-foreground mb-12">SELECT ROUTINE</div>
        <div className="w-full max-w-md space-y-6">
          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => handleSelectRoutine(routine)}
              className="w-full py-6 px-8 bg-accent bevel-element hover:bg-muted transition-all active:scale-98"
            >
              <div className="display-font text-3xl bevel-text mb-1">{routine.name}</div>
              <div className="label-font text-muted-foreground">
                {routine.exercises.length} EXERCISES
              </div>
            </button>
          ))}
        </div>
      </div>
    );

  }

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    initialSlide: 1,
    centerMode: true,
    centerPadding: "40px",
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
    afterChange: (index: number) => setCurrentSlide(index),
  };

  const slideCount = visibleSets.length + 2;

  // Active Workout View (View 3)
  if (currentView == 3) {
    return (
      <div className="h-full flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Exercise Pills
        <div className="px-4 sm:px-6 pt-4 sm:pt-8 pb-3 sm:pb-6 overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 pb-2">
            {currentRoutine.exercises.map((routineExercise, index) => {
              const exercise = exercises.find((e) => e.id === routineExercise.exerciseId);
              const isActive = index === currentExerciseIndex;
              return (
                <button
                  key={routineExercise.exerciseId}
                  onClick={() => setCurrentExerciseIndex(index)}
                  className={`px-6 py-2 whitespace-nowrap transition-all label-font text-xs ${
                    isActive
                      ? "bg-primary text-primary-foreground bevel-element scale-105"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {exercise?.name}
                </button>
              );
            })}
          </div>
        </div> */}

          {/* Rest Timer - Massive Typography */}

          <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-[60px] sm:py-5 shrink-0">
            <div className="display-font text-4xl md:text-5xl bevel-text">{currentExercise?.name ?? "EXERCISE"}</div>

            <div className="label-font text-muted-foreground mt-7 sm:mt-8">REST TIME</div>
            <div className="display-font text-[min(30vw,150px)] sm:text-[min(40vw,180px)] leading-none bevel-text-large mt-2 sm:mt-4">
              {timeRemaining > 0 ? formatTime(timeRemaining) : "--:--"}
            </div>

            {/* Progress Bar - Directional Lighting */}
            <div className="w-full max-w-sm h-1 bg-secondary mb-4 sm:mb-8 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{
                  width: `${100 - progress}%`,
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                }}
              />
            </div>

            <div className="flex gap-4 sm:gap-6">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-accent bevel-element hover:bg-muted transition-all active:scale-95 disabled:opacity-30"
                disabled={timeRemaining === 0}
              >
                {isTimerRunning ? <Pause size={20} className="sm:w-6 sm:h-6" /> : <Play size={20} className="sm:w-6 sm:h-6" />}
              </button>
              <button
                onClick={() => {
                  setTimeRemaining(restTime);
                  setIsTimerRunning(false);
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-accent bevel-element hover:bg-muted transition-all active:scale-95"
              >
                <RotateCcw size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Set View - Zero Chrome */}
          <div className="px-4 sm:px-6 pb-6 sm:pb-12 [&_.slick-list]:bg-transparent [&_.slick-track]:bg-transparent [&_.slick-slide]:bg-transparent">
            <Slider ref={sliderRef} {...sliderSettings}>
              <div className="px-2">
                <div className="flex flex-col items-center justify-center py-4 sm:py-8 min-h-[clamp(14rem,32vh,22rem)] gap-4 sm:gap-6">
                  <button
                    onClick={handleEndExercise}
                    className="w-[min(64vw,16rem)] aspect-square max-w-none px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98 flex items-center justify-center"
                  >
                    <div className="display-font text-[50px] sm:text-sm tracking-[0.3em] text-muted-foreground">END EXERCISE</div>
                  </button>
                </div>
              </div>

              <div className="px-2">
                <div className="flex flex-col items-center justify-center py-6 sm:py-12 gap-4 sm:gap-6">
                  <button
                    onClick={() => setPickerType("reps")}
                    className="w-3/4 max-w-[12rem] py-3 sm:py-4 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98"
                  >
                    {reps > 0 ? (
                      <div className="display-font text-2xl sm:text-3xl bevel-text">{reps}</div>
                    ) : (
                      <div className="label-font text-[10px] text-muted-foreground">REPS</div>
                    )}
                  </button>

                  <button
                    onClick={() => setPickerType("weight")}
                    className="w-3/4 max-w-[12rem] py-3 sm:py-4 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98"
                  >
                    {weight > 0 ? (
                      <div className="display-font text-2xl sm:text-3xl bevel-text">{weight}</div>
                    ) : (
                      <div className="label-font text-[10px] text-muted-foreground">WEIGHT</div>
                    )}
                  </button>

                  <button
                    onClick={handleLogSet}
                    disabled={reps === 0 || weight === 0}
                    className="w-3/4 max-w-[12rem] py-3 sm:py-4 bg-primary text-primary-foreground bevel-element hover:opacity-90 transition-all active:scale-98 disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    <span className="label-font">LOG SET</span>
                  </button>
                </div>
              </div>

              {[...visibleSets].reverse().map((set, index) => (
                <div key={index} className="px-1 sm:px-2">
                  <div className="flex flex-col items-center justify-center py-8 sm:py-14">
                    <div className="label-font text-[11px] sm:text-xs text-muted-foreground mb-5 sm:mb-8">
                      SET {visibleSets.length - index}
                    </div>
                    <div className="flex w-full max-w-sm sm:max-w-md items-end justify-center gap-4 sm:gap-6 mx-auto">
                      <div className="flex flex-1 flex-col items-center text-center">
                        <div className="display-font text-[min(18vw,92px)] sm:text-[min(22vw,112px)] leading-none bevel-text-large mb-2">
                          {set.reps}
                        </div>
                        <div className="label-font text-[11px] sm:text-xs text-muted-foreground">REPS</div>
                      </div>
                      <div className="flex flex-1 flex-col items-center text-center">
                        <div className="display-font text-[min(18vw,92px)] sm:text-[min(22vw,112px)] leading-none bevel-text-large mb-2">
                          {set.weight}
                        </div>
                        <div className="label-font text-[11px] sm:text-xs text-muted-foreground">LBS</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>

            <div className="mt-3 sm:mt-5 flex items-center justify-center gap-1.5 sm:gap-2 pb-0 sm:pb-1" aria-label="Set view position">
              {Array.from({ length: slideCount }).map((_, index) => {
                const isActive = index === currentSlide;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => sliderRef.current?.slickGoTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-200 ${isActive ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {pickerType === "reps" && (
          <ScrollPicker
            value={reps || 10}
            onChange={setReps}
            min={1}
            max={50}
            step={1}
            suffix=""
            title="REPS"
            onClose={() => setPickerType(null)}
          />
        )}

        {pickerType === "weight" && (
          <ScrollPicker
            value={weight || 45}
            onChange={setWeight}
            min={5}
            max={500}
            step={5}
            suffix=""
            title="WEIGHT"
            onClose={() => setPickerType(null)}
          />
        )}

        {/* Storage Limit Warning 
        
        This is a warning to the user that they are running out of storage space. 
        It is not a critical error, so it is not a critical warning. It is just a warning. 
        You can dismiss it by clicking on the "OK" button.
        
        open when storage <= 150MB
        close when storage > 150MB
        
      */}
        <AlertDialog open={showWarning} onOpenChange={(open) => !open && dismissWarning()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="display-font text-2xl bevel-text">Storage Limit Warning</AlertDialogTitle>
              <AlertDialogDescription className="label-font">
                Your workout history is currently using {storageStatus ? (storageStatus.currentSize / (1024 * 1024)).toFixed(1) : 0}MB of storage space.
                The recommended limit is 150MB. Please consider clearing older entries, though you may continue logging for now.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={dismissWarning} className="label-font bg-primary text-primary-foreground bevel-element hover:opacity-90 transition-all active:scale-98">
                CONTINUE
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
}