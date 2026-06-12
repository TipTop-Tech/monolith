MONOLITH AI ROUTINE AGENT FILES

Copy these into your existing repo. Do NOT replace the whole repo.

NEW FILES TO ADD:
1) new_files/src/app/lib/routineAgent.ts
   -> copy to: src/app/lib/routineAgent.ts

2) new_files/AI_ROUTINE_AGENT_NOTES.md
   -> copy to: AI_ROUTINE_AGENT_NOTES.md
   -> optional notes file, not needed for app runtime

CURRENT FILES TO REPLACE / EDIT:
1) replacement_files/src/app/components/routines/Routines.tsx
   -> replace: src/app/components/routines/Routines.tsx
   -> adds MANUAL and AI ROUTINE buttons, manual routine modal, AI routine modal, clarification flow, and routine creation.

2) replacement_files/src/app/context/WorkoutContext.tsx
   -> replace: src/app/context/WorkoutContext.tsx
   -> adds optional suggestedWeightLbs and coachNotes fields to RoutineExercise.

3) replacement_files/src/app/components/active-workout/ActiveWorkout.tsx
   -> replace: src/app/components/active-workout/ActiveWorkout.tsx
   -> uses AI suggested weights/notes in the active workout view.

4) replacement_files/package.json
   -> replace package.json ONLY IF your current package.json is missing react and react-dom under dependencies.
   -> If you prefer manual edit, add these under dependencies:
      "react": "18.3.1",
      "react-dom": "18.3.1"

After copying files:
1) npm install
2) npm run dev
3) Open Routines tab
4) You should see MANUAL and AI ROUTINE buttons under START ROUTINE

Notes:
- This is a local rule-based agent, not an OpenAI API agent yet.
- It uses a local exercise dictionary and starting-weight multipliers.
- No API key is needed for this version.
