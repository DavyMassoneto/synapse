import { type Consultation, type ResolvedModel } from "#synapse/modules/advisor/public/contracts"
import { buildTranscript, clip } from "../transcript"
import {
  ADVISOR_SYSTEM,
  ESTIMATED_CHARACTERS_PER_TOKEN,
  HOST_SAFETY_TOKENS,
  MAX_SYSTEM_CHARACTERS,
  MAX_SYSTEM_SHARE,
  MINIMUM_ANSWER_TOKENS,
  PROMPT_FRAME_CHARACTERS,
  PROMPT_PREFIX,
  PROMPT_SUFFIX,
  TRANSCRIPT_PREFIX,
  WINDOW_TOO_SMALL,
} from "./constants"
import { type PreparedPrompt, type PromptBudget } from "./types"

function availableBudget(model: ResolvedModel): PromptBudget {
  const requiredOutputTokens = model.reasoningTokens + MINIMUM_ANSWER_TOKENS
  if (requiredOutputTokens > model.maxOutputTokens) {
    return { kind: "insufficient" }
  }
  const inputTokens = model.contextWindow - HOST_SAFETY_TOKENS - model.maxOutputTokens
  if (inputTokens <= 0) {
    return { kind: "insufficient" }
  }
  const systemTokens = Math.ceil(ADVISOR_SYSTEM.length / ESTIMATED_CHARACTERS_PER_TOKEN)
  const available = (inputTokens - systemTokens) * ESTIMATED_CHARACTERS_PER_TOKEN
  if (available <= PROMPT_FRAME_CHARACTERS) {
    return { kind: "insufficient" }
  }
  return { kind: "available", characters: available - PROMPT_FRAME_CHARACTERS }
}

function systemLimit(characters: number): number {
  return Math.min(MAX_SYSTEM_CHARACTERS, Math.floor(characters * MAX_SYSTEM_SHARE))
}

export function preparePrompt(input: Consultation, model: ResolvedModel): PreparedPrompt {
  const budget = availableBudget(model)
  if (budget.kind === "insufficient") {
    return { kind: "failure", message: WINDOW_TOO_SMALL }
  }
  const system = clip(input.system, systemLimit(budget.characters))
  const transcript = buildTranscript(input.messages, budget.characters - system.length)
  return { kind: "ready", text: PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX }
}
