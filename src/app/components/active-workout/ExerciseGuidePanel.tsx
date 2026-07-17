import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { getExerciseGuide } from "../../data/exerciseGuides";
import type { Exercise } from "../../context/WorkoutContext";
import { GuideVideo } from "./GuideVideo";
import { MusclePoster } from "./MusclePoster";

function formatMuscle(slug: string) {
  return slug.replace(/-/g, " ");
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 bg-secondary label-font text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}

export function ExerciseGuidePanel({ exercise }: { exercise: Exercise }) {
  const guide = getExerciseGuide(exercise.name);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [exercise.id]);

  const video = videoFailed ? undefined : guide?.video;
  const [primary, ...secondary] = exercise.muscleGroups;

  return (
    <section className="px-4 sm:px-6 pt-2 pb-10 max-w-lg mx-auto w-full flex flex-col gap-4">
      <div>
        <div className="label-font text-muted-foreground">HOW TO</div>
        <h2 className="display-font text-3xl bevel-text">{exercise.name}</h2>
      </div>

      {video ? (
        <GuideVideo video={video} onUnavailable={() => setVideoFailed(true)} />
      ) : (
        <MusclePoster muscleGroups={exercise.muscleGroups} />
      )}

      <div className="flex flex-wrap gap-2">
        {primary && <Chip>PRIMARY: {formatMuscle(primary)}</Chip>}
        {secondary.length > 0 && (
          <Chip>SECONDARY: {secondary.map(formatMuscle).join(", ")}</Chip>
        )}
        {guide?.equipment && <Chip>{guide.equipment}</Chip>}
        {guide?.level && <Chip>{guide.level}</Chip>}
      </div>

      {guide ? (
        <ol className="flex flex-col gap-3">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="display-font text-2xl text-muted-foreground w-6 shrink-0 text-right">
                {i + 1}
              </span>
              <p className="user-text text-sm leading-relaxed text-foreground/90 pt-0.5">
                {step}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="user-text text-sm text-muted-foreground">
          Step-by-step instructions for this exercise are coming soon.
        </p>
      )}

      {guide?.mistakes && guide.mistakes.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2 border-t border-border">
            <span className="label-font text-xs">COMMON MISTAKES</span>
            <ChevronDown
              size={16}
              className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-2 pb-2">
              {guide.mistakes.map((mistake, i) => (
                <li
                  key={i}
                  className="user-text text-sm leading-relaxed text-foreground/90"
                >
                  {mistake}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {guide?.tip && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between py-2 border-t border-border">
            <span className="label-font text-xs">PRO TIP</span>
            <ChevronDown
              size={16}
              className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="user-text text-sm leading-relaxed text-foreground/90 pb-2">
              {guide.tip}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      <p className="user-text text-xs text-muted-foreground border-t border-border pt-3">
        Demonstration only. Consult a professional for form coaching.
      </p>
    </section>
  );
}
