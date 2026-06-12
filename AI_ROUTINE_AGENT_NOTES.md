# AI Routine Agent Prototype

This branch adds a local routine-generation agent to the Routines tab.

## What changed

- Manual routine creation now starts from a clear "Manual Routine" button.
- AI routine creation is available from an "AI Routine" button.
- The agent asks for clarification when the prompt is too vague.
- The user can click "Generate anyway" to use safe defaults.
- Generated routines include exercise selection, sets/reps, optional starting-weight estimates, and coach notes.
- The starting-weight estimate uses the current prototype formula map:
  - legs/squat-style: bodyweight × 0.45
  - back/deadlift-style: bodyweight × 0.55
  - chest/bench-style: bodyweight × 0.35
  - arms/upper-body isolation: bodyweight × 0.10
- The app now stores optional `suggestedWeightLbs` and `coachNotes` on routine exercises.

## Important note

This is a local deterministic agent, not a real LLM/API call yet. That is intentional for the prototype because API keys should not be placed directly inside a browser React app. Later, `generateRoutineWithAgent()` in `src/app/lib/routineAgent.ts` can be replaced with a backend endpoint that calls an LLM.
