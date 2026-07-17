import { useEffect, useState } from "react";
import Model from "react-body-highlighter";
import { useTheme } from "../../hooks/useTheme";

const APP_TO_LIB: Record<string, string[]> = {
  chest: ["chest"],
  triceps: ["triceps"],
  biceps: ["biceps"],
  "front-deltoids": ["front-deltoids"],
  "back-deltoids": ["back-deltoids"],
  quadriceps: ["quadriceps"],
  hamstring: ["hamstring"],
  gluteal: ["gluteal"],
  calves: ["calves"],
  "lower-back": ["lower-back"],
  "mid-back": ["upper-back"],
  "upper-back": ["trapezius"],
  lats: ["upper-back"],
  forearm: ["forearm"],
  abs: ["abs"],
  obliques: ["obliques"],
  adductor: ["adductor"],
  abductors: ["abductors"],
  neck: ["neck"],
  head: ["head"],
};

export function MusclePoster({ muscleGroups }: { muscleGroups: string[] }) {
  const { resolved } = useTheme();
  const [accent, setAccent] = useState("#ffffff");

  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    if (value.startsWith("#")) setAccent(value);
  }, [resolved]);

  const [primary, ...secondary] = muscleGroups;
  const primaryLib = APP_TO_LIB[primary] ?? [];
  const secondaryLib = [
    ...new Set(secondary.flatMap((slug) => APP_TO_LIB[slug] ?? [])),
  ].filter((muscle) => !primaryLib.includes(muscle));

  const data = [
    { name: "secondary", muscles: secondaryLib },
    { name: "primary", muscles: primaryLib },
    { name: "primary-boost", muscles: primaryLib },
  ];
  const colors = [`${accent}59`, accent];

  const modelStyle = {
    background: "transparent",
    backgroundColor: "transparent",
    height: "100%",
  };
  const svgStyle = {
    background: "transparent",
    backgroundColor: "transparent",
    height: "100%",
    width: "auto",
  };

  return (
    <div className="relative w-full aspect-video bg-secondary overflow-hidden flex items-center justify-center gap-8 py-3">
      <Model
        data={data}
        type="anterior"
        highlightedColors={colors}
        style={modelStyle}
        svgStyle={svgStyle}
      />
      <Model
        data={data}
        type="posterior"
        highlightedColors={colors}
        style={modelStyle}
        svgStyle={svgStyle}
      />
      <span className="absolute top-2 right-2 label-font text-[9px] text-muted-foreground">
        DEMO SOON
      </span>
    </div>
  );
}
