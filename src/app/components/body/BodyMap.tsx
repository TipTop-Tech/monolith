import { useLocation, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@powersync/react";
import Model from "react-body-highlighter";
import type { Muscle } from "react-body-highlighter/dist/component/metadata";
import { useIsMobile } from "../ui/use-mobile";
import { haptics } from "../../lib/haptics";
import { useWorkout } from "../../context/WorkoutContext";
import { playBodyMapSound } from "../../../utils/audio";

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
  const { exercises } = useWorkout();
  const { data: workoutHistoryRows } = useQuery(
    "SELECT * FROM workoutHistory ORDER BY date ASC"
  );

  useEffect(() => {
    playBodyMapSound();
  }, []);

  const hasHistoryForMuscleGroup = (muscleName: string) => {
    return (workoutHistoryRows ?? []).some((entry) => {
      const exercise = exercises.find((item) => item.id === entry.exerciseId);
      return exercise?.muscleGroups.includes(muscleName);
    });
  };

  const getMuscleConsistencyScore = (muscleName: string) => {
    const rows = workoutHistoryRows ?? [];
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const trainingDays = new Set<string>();

    rows.forEach((entry) => {
      const exercise = exercises.find((item) => item.id === entry.exerciseId);
      if (!exercise?.muscleGroups.includes(muscleName)) return;

      const entryTime = new Date(entry.date).getTime();
      if (entryTime < oneWeekAgo) return;

      const dayKey = new Date(entryTime).toISOString().slice(0, 10);
      trainingDays.add(dayKey);
    });

    return trainingDays.size;
  };

  const getFrequencyForMuscle = (muscleName: string) => {
    const score = getMuscleConsistencyScore(muscleName);
    if (score < 1) return 1;
    if (score < 2) return 2;
    if (score < 3) return 3;
    return 4;
  };

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

  const modelData = Object.keys(MUSCLE_TO_GROUP)
    .map((muscleName) => {
      const frequency = getFrequencyForMuscle(muscleName);
      return frequency > 0
        ? {
          name: muscleName,
          muscles: [muscleName as Muscle],
          frequency,
        }
        : null;
    })
    .filter(Boolean);

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
          data-active={view === "front"}
          className="px-5 py-2 text-sm transition-all label-font sm:px-8 sm:py-3 sm:text-base black-glass-button"
        >
          <span className="black-glass-text">FRONT</span>
        </button>
        <button
          onClick={() => {
            setView("back");
            setSelectedMuscle(null);
            setEmptyZone(false);
          }}
          data-active={view === "back"}
          className="px-5 py-2 text-sm transition-all label-font sm:px-8 sm:py-3 sm:text-base black-glass-button"
        >
          <span className="black-glass-text">BACK</span>
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="body-map-model relative h-full max-w-full" onClick={handleMapClick}>
          <Model
            data={modelData}
            type={view === "front" ? "anterior" : "posterior"}
            highlightedColors={[
              "#2a2a2a", // no or low history
              "#505050", // low
              "#989898", // medium
              "#ffffff", // very high
            ]}
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