import type { Exercise } from "../context/WorkoutContext";
import type { RoutineAgentInput, RoutineAgentResult } from "./routineAgent";

const DEFAULT_AGENT_API_URL = "http://localhost:8787";

type OpenAIAgentPayload = RoutineAgentInput & {
  exercises: Exercise[];
};

function getAgentApiBaseUrl() {
  // Optional override for deployed environments or nonstandard local ports.
  // Example: VITE_AGENT_API_URL=https://your-backend.example.com
  const configuredUrl = import.meta.env.VITE_AGENT_API_URL as string | undefined;
  return configuredUrl?.replace(/\/$/, "") || DEFAULT_AGENT_API_URL;
}

function normalizeAgentResult(result: unknown): RoutineAgentResult {
  if (!result || typeof result !== "object") {
    throw new Error("OpenAI agent returned an empty or invalid response.");
  }

  const candidate = result as RoutineAgentResult;

  if (candidate.status === "needs_clarification") {
    return {
      status: "needs_clarification",
      message: candidate.message || "The OpenAI agent needs more detail before generating the routine.",
      questions: Array.isArray(candidate.questions) ? candidate.questions : [],
    };
  }

  if (candidate.status === "ready" && candidate.routine) {
    return candidate;
  }

  throw new Error("OpenAI agent returned an unsupported response shape.");
}

export async function generateRoutineWithOpenAI(
  exercises: Exercise[],
  input: RoutineAgentInput
): Promise<RoutineAgentResult> {
  const payload: OpenAIAgentPayload = {
    ...input,
    exercises,
  };

  const response = await fetch(`${getAgentApiBaseUrl()}/api/generate-routine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      responseBody && typeof responseBody.error === "string"
        ? responseBody.error
        : `OpenAI agent request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return normalizeAgentResult(responseBody);
}
