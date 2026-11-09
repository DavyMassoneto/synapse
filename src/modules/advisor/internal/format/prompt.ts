import { type Consultation, type ResolvedModel } from "#synapse/modules/advisor/public/contracts"
import { ADVISOR_SYSTEM } from "../constants"
import { clip } from "./clip"
import {
  ESTIMATED_CHARACTERS_PER_TOKEN,
  HOST_SAFETY_TOKENS,
  MAX_SYSTEM_CHARACTERS,
  MINIMUM_ANSWER_TOKENS,
  NO_BUDGET,
  PROMPT_PREFIX,
  PROMPT_SUFFIX,
  TRANSCRIPT_PREFIX,
} from "./constants"
import { buildTranscript } from "./transcript"
import { type PreparedPrompt } from "./types"

function availableBudget(model: ResolvedModel): number {
  const requiredOutputTokens = model.reasoningTokens + MINIMUM_ANSWER_TOKENS
  if (requiredOutputTokens > model.maxOutputTokens) {
    return NO_BUDGET
  }
  const inputTokens = model.contextWindow - HOST_SAFETY_TOKENS - model.maxOutputTokens
  if (inputTokens <= 0) {
    return NO_BUDGET
  }
  const available = inputTokens * ESTIMATED_CHARACTERS_PER_TOKEN - ADVISOR_SYSTEM.length
  const fixedLength = PROMPT_PREFIX.length + TRANSCRIPT_PREFIX.length + PROMPT_SUFFIX.length
  if (available <= fixedLength) {
    return NO_BUDGET
  }
  return available - fixedLength
}

export function preparePrompt(input: Consultation, model: ResolvedModel): PreparedPrompt {
  const budget = availableBudget(model)
  if (budget === NO_BUDGET) {
    return undefined
  }
  const systemLimit = Math.min(MAX_SYSTEM_CHARACTERS, Math.floor(budget / 2))
  const system = clip(input.system, systemLimit)
  const transcriptBudget = budget - system.length
  const transcript = buildTranscript(input.messages, transcriptBudget)
  return PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX
}
