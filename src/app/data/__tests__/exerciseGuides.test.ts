import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getExerciseGuide } from "../exerciseGuides";

const contextSource = readFileSync(
  resolve(process.cwd(), "src/app/context/WorkoutContext.tsx"),
  "utf-8"
);

const exerciseBlock = contextSource.slice(
  contextSource.indexOf("SAMPLE_EXERCISES"),
  contextSource.indexOf("SAMPLE_ROUTINES")
);

const exerciseNames = [...exerciseBlock.matchAll(/name: "([^"]+)"/g)].map(
  (match) => match[1]
);

describe("exercise guides", () => {
  it("extracts the exercise list from WorkoutContext", () => {
    expect(exerciseNames.length).toBeGreaterThanOrEqual(72);
  });

  it("resolves a guide with steps for every exercise", () => {
    const missing = exerciseNames.filter(
      (name) => !getExerciseGuide(name)?.steps.length
    );
    expect(missing).toEqual([]);
  });
});
