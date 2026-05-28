import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import Model from "react-body-highlighter";
import { useIsMobile } from "./ui/use-mobile";

const MUSCLE_TO_GROUP: { [key: string]: string } = {
  "chest": "chest",
  "front-deltoids": "front-deltoids",
  "back-deltoids": "back-deltoids",
  "biceps": "biceps",
  "triceps": "triceps",
  "upper-back": "mid-back",
  "lower-back": "lower-back",
  "trapezius": "upper-back",
  "abs": "abs",
  "obliques": "obliques",
  "quadriceps": "quadriceps",
  "hamstring": "hamstrings",
  "gluteal": "gluteal",
  "calves": "calves",
  "adductor": "adductor",
  "abductors": "abductors",
  "forearm": "forearm",
  "head": "head",
  "neck": "neck",
};

export function BodyMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const initialView =
    location.state &&
    typeof location.state === "object" &&
    "view" in location.state &&
    location.state.view === "back"
      ? "back"
      : "front";
  const [view, setView] = useState<"front" | "back">(initialView);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const handleMuscleClick = (muscle: { muscle: string }) => {
    const muscleName = muscle.muscle;

    const muscleGroup = MUSCLE_TO_GROUP[muscleName];
    if (muscleGroup) {
      if (isMobile) {
        navigate(`/muscle/${muscleGroup}`, { state: { view } });
        return;
      }

      navigate(`/muscle/${muscleGroup}`, { state: { view } });
    }
  };

  const modelData = selectedMuscle
    ? [
        {
          name: selectedMuscle,
          muscles: [selectedMuscle],
        },
      ]
    : [];

  const instructionText = isMobile
    ? "TAP ONCE TO HIGHLIGHT, TAP AGAIN TO VIEW EXERCISES"
    : "HOVER TO PREVIEW, TAP MUSCLE TO VIEW EXERCISES";

  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-auto px-3 py-2 sm:p-8">
      <div className="flex justify-center gap-2 mb-4 sm:gap-6 sm:mb-8">
        <button
          onClick={() => {
            setView("front");
            setSelectedMuscle(null);
          }}
          className={`px-5 py-2 text-sm transition-all label-font sm:px-8 sm:py-3 sm:text-base ${
            view === "front"
              ? "bg-primary text-primary-foreground bevel-element scale-105"
              : "bg-secondary text-muted-foreground hover:bg-accent"
          }`}
        >
          FRONT
        </button>
        <button
          onClick={() => {
            setView("back");
            setSelectedMuscle(null);
          }}
          className={`px-5 py-2 text-sm transition-all label-font sm:px-8 sm:py-3 sm:text-base ${
            view === "back"
              ? "bg-primary text-primary-foreground bevel-element scale-105"
              : "bg-secondary text-muted-foreground hover:bg-accent"
          }`}
        >
          BACK
        </button>
      </div>

      <div
        className={`body-map-model mx-auto ${
          isMobile ? "w-[min(84vw,20rem)]" : "w-full max-w-md"
        }`}
      >
        <div className="relative">
          <Model
            data={modelData}
            type={view === "front" ? "anterior" : "posterior"}
            style={{ background: "transparent", backgroundColor: "transparent" }}
            svgStyle={{ background: "transparent", backgroundColor: "transparent" }}
            onClick={handleMuscleClick}
          />
        </div>
      </div>

      <div className="text-center label-font text-[9px] text-muted-foreground mt-2 sm:mt-8 sm:text-sm">
        {instructionText}
      </div>
    </div>
  );
}
