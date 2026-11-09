import { type Consultation, type ResolvedModel } from "#synapse/modules/advisor/public/contracts"
import { clip } from "./clip"
import {
  ADVISOR_SYSTEM,
  ESTIMATED_CHARACTERS_PER_TOKEN,
  HOST_SAFETY_TOKENS,
  MAX_SYSTEM_CHARACTERS,
  MINIMUM_ANSWER_TOKENS,
  PROMPT_DIAGNOSTICS,
  PROMPT_PREFIX,
  PROMPT_SUFFIX,
  TRANSCRIPT_PREFIX,
} from "./constants"
import { buildTranscript } from "./transcript"
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
  const available = inputTokens * ESTIMATED_CHARACTERS_PER_TOKEN - ADVISOR_SYSTEM.length
  const fixedLength = PROMPT_PREFIX.length + TRANSCRIPT_PREFIX.length + PROMPT_SUFFIX.length
  if (available <= fixedLength) {
    return { kind: "insufficient" }
  }
  return { kind: "available", characters: available - fixedLength }
}

export function preparePrompt(input: Consultation, model: ResolvedModel): PreparedPrompt {
  const budget = availableBudget(model)
  if (budget.kind === "insufficient") {
    return { kind: "failure", message: PROMPT_DIAGNOSTICS.windowTooSmall }
  }
  const systemLimit = Math.min(MAX_SYSTEM_CHARACTERS, Math.floor(budget.characters / 2))
  const system = clip(input.system, systemLimit)
  const transcriptBudget = budget.characters - system.length
  const transcript = buildTranscript(input.messages, transcriptBudget)
  return { kind: "ready", text: PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX }
}
