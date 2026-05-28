import { useState, useEffect, useRef } from "react";
import { useWorkout } from "../context/WorkoutContext";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
// react-slick has no bundled TypeScript declarations; ignore the missing types here
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: module has no type declarations
import Slider from "react-slick";
import { ScrollPicker } from "./ScrollPicker";

export function ActiveWorkout() {
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

  const currentExercise = currentRoutine
    ? exercises.find(
        (e) => e.id === currentRoutine.exercises[currentExerciseIndex]?.exerciseId
      )
    : null;

  const currentExerciseHistory = currentExercise
    ? history.find((h) => h.exerciseId === currentExercise.id)
    : null;

  const todaysSets = currentExerciseHistory?.sets.filter((set) => {
    const setDate = new Date(set.date).toDateString();
    const today = new Date().toDateString();
    return setDate === today;
  }) || [];

  const handleLogSet = () => {
    if (!currentExercise || reps === 0 || weight === 0) return;

    addSet(currentExercise.id, reps, weight);
    setReps(0);
    setWeight(0);
    setTimeRemaining(restTime);
    setIsTimerRunning(true);

    setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeRemaining > 0 ? (timeRemaining / restTime) * 100 : 0;

  if (!currentRoutine) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="label-font text-muted-foreground mb-12">SELECT ROUTINE</div>
        <div className="w-full max-w-md space-y-6">
          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => {
                setCurrentRoutine(routine);
                setCurrentExerciseIndex(0);
              }}
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
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
    centerPadding: "40px",
    dotsClass: "slick-dots custom-dots",
  };

  return (
    <div className="h-full flex flex-col ">
      <div className="flex-1 flex flex-col">
        {/* Exercise Pills */}
        <div className="px-6 pt-8 pb-6 overflow-x-auto">
          <div className="flex gap-4 pb-2">
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
        </div>

        {/* Rest Timer - Massive Typography */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="label-font text-muted-foreground mb-4">REST TIME</div>
          <div className="display-font text-[min(40vw,180px)] leading-none bevel-text-large mb-8">
            {timeRemaining > 0 ? formatTime(timeRemaining) : "--:--"}
          </div>

          {/* Progress Bar - Directional Lighting */}
          <div className="w-full max-w-sm h-1 bg-secondary mb-8 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{
                width: `${100 - progress}%`,
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
              }}
            />
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-14 h-14 flex items-center justify-center bg-accent bevel-element hover:bg-muted transition-all active:scale-95 disabled:opacity-30"
              disabled={timeRemaining === 0}
            >
              {isTimerRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={() => {
                setTimeRemaining(restTime);
                setIsTimerRunning(false);
              }}
              className="w-14 h-14 flex items-center justify-center bg-accent bevel-element hover:bg-muted transition-all active:scale-95"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {/* Set View - Zero Chrome */}
        <div className="px-6 pb-12 [&_.slick-list]:bg-transparent [&_.slick-track]:bg-transparent [&_.slick-slide]:bg-transparent">
          <Slider ref={sliderRef} {...sliderSettings}>
            <div className="px-2">
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <button
                  onClick={() => setPickerType("reps")}
                  className="w-3/4 py-4 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98"
                >
                  {reps > 0 ? (
                    <div className="display-font text-4xl bevel-text">{reps}</div>
                  ) : (
                    <div className="label-font text-muted-foreground">REPS</div>
                  )}
                </button>

                <button
                  onClick={() => setPickerType("weight")}
                  className="w-3/4 py-4 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98"
                >
                  {weight > 0 ? (
                    <div className="display-font text-4xl bevel-text">{weight}</div>
                  ) : (
                    <div className="label-font text-muted-foreground">WEIGHT</div>
                  )}
                </button>

                <button
                  onClick={handleLogSet}
                  disabled={reps === 0 || weight === 0}
                  className="w-3/4 py-4 bg-primary text-primary-foreground bevel-element hover:opacity-90 transition-all active:scale-98 disabled:opacity-20 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  <span className="label-font">LOG SET</span>
                </button>
              </div>
            </div>

            {[...todaysSets].reverse().map((set, index) => (
              <div key={index} className="px-2">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="label-font text-muted-foreground mb-8">
                    SET {todaysSets.length - index}
                  </div>
                  <div className="display-font text-[min(25vw,120px)] leading-none bevel-text-large mb-2">
                    {set.reps}
                  </div>
                  <div className="label-font text-muted-foreground mb-8">REPS</div>
                  <div className="display-font text-[min(20vw,100px)] leading-none bevel-text-large">
                    {set.weight}
                  </div>
                  <div className="label-font text-muted-foreground">LBS</div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          onClick={() => setCurrentRoutine(null)}
          className="w-full py-3 label-font text-muted-foreground hover:text-foreground transition-colors"
        >
          END WORKOUT
        </button>
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
    </div>
  );
}
