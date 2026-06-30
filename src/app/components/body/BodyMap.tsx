import { useLocation, useNavigate } from "react-router";
import { useState, useRef } from "react";
import Model from "react-body-highlighter";
import { useIsMobile } from "../ui/use-mobile";
import { haptics } from "../../lib/haptics";

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
  "knees": "quadriceps",
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
  const [emptyZone, setEmptyZone] = useState(false);
  const muscleHitRef = useRef(false);

  const handleMuscleClick = (muscle: { muscle: string }) => {
    muscleHitRef.current = true; 
    const muscleName = muscle.muscle;
    const muscleGroup = MUSCLE_TO_GROUP[muscleName];
    if (!muscleGroup) return;
    haptics.tap(); // confirm a successful muscle click
    setEmptyZone(false);

    if (isMobile && selectedMuscle !== muscleName) {
      setSelectedMuscle(muscleName);
      return;
    }
    navigate(`/muscle/${muscleGroup}`, { state: { view } });
  };

  const handleMapClick = () => {
    if (muscleHitRef.current) {
      muscleHitRef.current = false;
      return;
    }
    setSelectedMuscle(null);
    setEmptyZone(true);
  };

  const modelData = selectedMuscle
    ? [
        {
          name: selectedMuscle,
          muscles: [selectedMuscle],
        },
      ]
    : [];

  const formatBodyLabel = (value: string) => value.replace(/-/g, " ");

  const instructionText = isMobile
    ? "TAP A MUSCLE TO HIGHLIGHT"
    : "HOVER TO PREVIEW, TAP MUSCLE TO VIEW EXERCISES";

  return (
    <div className="flex h-full flex-col items-center overflow-hidden px-3 py-2 sm:p-8">
      <div className="flex shrink-0 justify-center gap-2 mb-4 sm:gap-6 sm:mb-8">
        <button
          onClick={() => {
            setView("front");
            setSelectedMuscle(null);
            setEmptyZone(false);
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
            setEmptyZone(false);
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

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="body-map-model relative h-full max-w-full" onClick={handleMapClick}>
          <Model
            data={modelData}
            type={view === "front" ? "anterior" : "posterior"}
            highlightedColors={["#ffffff"]}
            style={{ background: "transparent", backgroundColor: "transparent", height: "100%" }}
            svgStyle={{ background: "transparent", backgroundColor: "transparent", height: "100%", width: "auto", maxWidth: "100%" }}
            onClick={handleMuscleClick}
          />
        </div>
      </div>

      <div className="flex h-14 shrink-0 flex-col items-center justify-center text-center mt-2 sm:mt-6 sm:h-16">
        {isMobile && selectedMuscle ? (
          <>
            <div className="display-font text-xl bevel-text sm:text-2xl">
              {formatBodyLabel(selectedMuscle)}
            </div>
            <div className="label-font text-[9px] text-muted-foreground mt-1 sm:text-sm">
              TAP AGAIN FOR {formatBodyLabel(MUSCLE_TO_GROUP[selectedMuscle])} EXERCISES
            </div>
          </>
        ) : emptyZone ? (
          <div className="label-font text-[9px] text-muted-foreground sm:text-sm">
            NO MUSCLE HERE YET
          </div>
        ) : (
          <div className="label-font text-[9px] text-muted-foreground sm:text-sm">
            {instructionText}
          </div>
        )}
      </div>
    </div>
  );
}