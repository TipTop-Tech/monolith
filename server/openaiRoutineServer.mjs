import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";

const PORT = Number(process.env.AGENT_SERVER_PORT || 8787);
const MODEL = process.env.OPENAI_ROUTINE_MODEL || "gpt-4o-mini";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const routineSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "message", "questions", "routine", "summary", "assumptions"],
  properties: {
    status: { type: "string", enum: ["ready", "needs_clarification"] },
    message: { type: ["string", "null"] },
    questions: {
      type: "array",
      items: { type: "string" },
    },
    routine: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["id", "name", "exercises"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            exercises: {
              type: "array",
              minItems: 3,
              maxItems: 10,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["exerciseId", "sets", "targetReps", "suggestedWeightLbs", "coachNotes"],
                properties: {
                  exerciseId: { type: "string" },
                  sets: { type: "integer", minimum: 1, maximum: 6 },
                  targetReps: { type: "integer", minimum: 1, maximum: 30 },
                  suggestedWeightLbs: { type: ["number", "null"], minimum: 0 },
                  coachNotes: { type: "string" },
                },
              },
            },
          },
        },
        { type: "null" },
      ],
    },
    summary: { type: "string" },
    assumptions: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = "";

    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });

    request.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function normalizeText(value) {
  return String(value || "").trim();
}

function buildExerciseCatalog(exercises) {
  return exercises
    .filter((exercise) => exercise && exercise.id && exercise.name)
    .map((exercise) => {
      const muscleGroups = Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups : [];
      const primaryMuscle = muscleGroups[0] || "unknown";
      return {
        id: String(exercise.id),
        name: String(exercise.name),
        primaryMuscle,
        muscleGroups,
      };
    });
}

function sanitizeResult(rawResult, availableExercises) {
  const availableIds = new Set(availableExercises.map((exercise) => exercise.id));

  if (rawResult.status === "needs_clarification") {
    return {
      status: "needs_clarification",
      message: rawResult.message || "Can you add a little more detail?",
      questions: Array.isArray(rawResult.questions) ? rawResult.questions : [],
    };
  }

  const rawRoutine = rawResult.routine;
  const rawExercises = Array.isArray(rawRoutine?.exercises) ? rawRoutine.exercises : [];
  const seenIds = new Set();

  const routineExercises = rawExercises
    .filter((entry) => entry && availableIds.has(String(entry.exerciseId)))
    .filter((entry) => {
      const id = String(entry.exerciseId);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .slice(0, 10)
    .map((entry) => ({
      exerciseId: String(entry.exerciseId),
      sets: Math.min(6, Math.max(1, Math.round(Number(entry.sets) || 3))),
      targetReps: Math.min(30, Math.max(1, Math.round(Number(entry.targetReps) || 10))),
      suggestedWeightLbs:
        entry.suggestedWeightLbs === null || entry.suggestedWeightLbs === undefined
          ? undefined
          : Math.round(Number(entry.suggestedWeightLbs) * 2) / 2,
      coachNotes: normalizeText(entry.coachNotes) || "Use clean form and adjust load as needed.",
    }));

  if (routineExercises.length < 3) {
    return {
      status: "needs_clarification",
      message: "The AI response did not map cleanly to enough available exercises in the app.",
      questions: [
        "Try naming a common split like chest/back, push, pull, legs, upper body, or full body.",
        "If you requested a specific exercise, make sure it exists in the app exercise list or allow a close substitute.",
      ],
    };
  }

  return {
    status: "ready",
    routine: {
      id: randomUUID(),
      name: normalizeText(rawRoutine?.name) || "AI Workout",
      exercises: routineExercises,
    },
    summary: normalizeText(rawResult.summary) || "Generated with the OpenAI routine agent.",
    assumptions: Array.isArray(rawResult.assumptions)
      ? rawResult.assumptions.map(normalizeText).filter(Boolean)
      : [],
  };
}

function buildSystemPrompt() {
  return `You are the OpenAI routine-generation agent for Monolith, a minimal workout logging app.

Your job is to turn the user's workout request into a realistic routine using ONLY the available exercises provided by the app.

Hard rules:
- Return only the requested JSON shape.
- Use exact exercise IDs from the available exercise catalog. Do not invent exercise IDs.
- If the user asks for a specific exercise that exists, include it.
- If the user asks for a specific exercise that does not exist, choose the closest available substitute and explain that in assumptions.
- Treat the first muscle in muscleGroups as the primary muscle. Secondary muscles do not satisfy a primary target.
- For split prompts like chest/back, chest/triceps, back/biceps, or legs/core, balance the routine across the named primary targets.
- For chest-focused prompts, include at least one real chest press movement if available: Bench Press, Incline Bench Press, Dumbbell Press, or Smith Chest Press.
- Do not let triceps exercises count as chest just because chest is secondary.
- For nuanced athletic prompts, adapt the exercise selection to the sport, soreness, recovery, and intensity described by the user.
- Use reasonable sets and reps: strength 3-5 sets of 3-8 reps, hypertrophy 3-4 sets of 8-15 reps, recovery/accessories 2-3 sets of 12-20 reps.
- Keep the routine appropriate for the requested duration: 30 min = 4-5 exercises, 45 min = 5-6, 60 min = 6-8, 75 min = 7-9.
- If the prompt is too vague and generateAnyway is false, return needs_clarification with 2-3 short questions.
- If generateAnyway is true, create the best balanced default routine using the details available.

Starting weight guidance:
- Use bodyweight multipliers only as rough first-set estimates when bodyWeightLbs is provided.
- chest press style: bodyweight × 0.35
- squat/leg style: bodyweight × 0.45
- deadlift/back compound style: bodyweight × 0.55
- arms/isolation style: bodyweight × 0.10
- Reduce load for beginner, sore, recovery, or light prompts.
- Use null for bodyweight movements or when a suggested load would be misleading.`;
}

function buildUserPrompt(payload, exerciseCatalog) {
  return JSON.stringify(
    {
      userRequest: payload.prompt || "",
      durationMinutes: payload.durationMinutes ?? null,
      bodyWeightLbs: payload.bodyWeightLbs ?? null,
      sex: payload.sex || "unspecified",
      experience: payload.experience || "beginner",
      generateAnyway: Boolean(payload.generateAnyway),
      availableExercises: exerciseCatalog,
    },
    null,
    2
  );
}

async function handleGenerateRoutine(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 500, {
      error: "OPENAI_API_KEY is not set on the backend. Set it as an environment variable and restart npm run dev:ai.",
    });
    return;
  }

  const payload = await readJson(request);
  const exerciseCatalog = buildExerciseCatalog(payload.exercises || []);

  if (exerciseCatalog.length === 0) {
    sendJson(response, 400, { error: "No exercises were provided to the OpenAI agent." });
    return;
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.35,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(payload, exerciseCatalog) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "monolith_routine_agent_result",
        strict: true,
        schema: routineSchema,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content);
  sendJson(response, 200, sanitizeResult(parsed, exerciseCatalog));
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === "POST" && request.url === "/api/generate-routine") {
      await handleGenerateRoutine(request, response);
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true, model: MODEL });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "OpenAI routine server failed.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`OpenAI routine agent server running at http://localhost:${PORT}`);
});
