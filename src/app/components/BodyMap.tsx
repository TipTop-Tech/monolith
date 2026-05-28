import { useNavigate } from "react-router";
import { useState } from "react";
import Model from "react-body-highlighter";

const MUSCLE_TO_GROUP: { [key: string]: string } = {
  "chest": "chest",
  "front-deltoids": "shoulders",
  "back-deltoids": "shoulders",
  "biceps": "biceps",
  "triceps": "triceps",
  "upper-back": "back",
  "lower-back": "back",
  "trapezius": "back",
  "abs": "abs",
  "obliques": "abs",
  "quadriceps": "quads",
  "hamstring": "hamstrings",
  "gluteal": "glutes",
  "calves": "calves",
  "adductor": "quads",
  "abductors": "glutes",
  "forearm": "biceps",
  "head": "shoulders",
  "neck": "shoulders",
};

export function BodyMap() {
  const navigate = useNavigate();
  const [view, setView] = useState<"front" | "back">("front");

  const handleMuscleClick = (muscle: { muscle: string }) => {
    const muscleName = muscle.muscle;
    const muscleGroup = MUSCLE_TO_GROUP[muscleName];
    if (muscleGroup) {
      navigate(`/muscle/${muscleGroup}`);
    }
  };

  const data = Object.keys(MUSCLE_TO_GROUP).map((muscle) => ({
    name: muscle,
    muscles: [muscle],
  }));

  return (
    <div className="h-full overflow-auto p-8">
      <div className="label-font text-muted-foreground mb-12">MUSCLE GROUPS</div>

      <div className="flex justify-center gap-6 mb-12">
        <button
          onClick={() => setView("front")}
          className={`px-8 py-3 transition-all label-font ${
            view === "front"
              ? "bg-primary text-primary-foreground bevel-element scale-105"
              : "bg-secondary text-muted-foreground hover:bg-accent"
          }`}
        >
          FRONT
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-8 py-3 transition-all label-font ${
            view === "back"
              ? "bg-primary text-primary-foreground bevel-element scale-105"
              : "bg-secondary text-muted-foreground hover:bg-accent"
          }`}
        >
          BACK
        </button>
      </div>

      <div className="max-w-md mx-auto glow-subtle">
        <Model
          partsInput={view === "front" ? {} : {}}
          onClick={handleMuscleClick}
          side={view}
        />
      </div>

      <div className="text-center label-font text-muted-foreground mt-12">
        TAP MUSCLE TO VIEW EXERCISES
      </div>
    </div>
  );
}
