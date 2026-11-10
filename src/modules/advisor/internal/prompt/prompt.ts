import { type Consultation, type ResolvedModel } from "#synapse/modules/advisor/public/contracts"
import { ADVISOR_SYSTEM } from "../constants"
import { buildTranscript, clip } from "../transcript"
import {
  ESTIMATED_CHARACTERS_PER_TOKEN,
  HOST_SAFETY_TOKENS,
  MAX_SYSTEM_CHARACTERS,
  MINIMUM_ANSWER_TOKENS,
  PROMPT_PREFIX,
  PROMPT_SUFFIX,
  TRANSCRIPT_PREFIX,
  WINDOW_TOO_SMALL,
} from "./constants"
import { type PreparedPrompt, type PromptBudget } from "./types"

function assemblePrompt(system: string, transcript: string): string {
  return PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX
}

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
  const fixedLength = assemblePrompt("", "").length
  if (available <= fixedLength) {
    return { kind: "insufficient" }
  }
  return { kind: "available", characters: available - fixedLength }
}

function systemLimit(characters: number): number {
  return Math.min(MAX_SYSTEM_CHARACTERS, Math.floor(characters / 2))
}

export function preparePrompt(input: Consultation, model: ResolvedModel): PreparedPrompt {
  const budget = availableBudget(model)
  if (budget.kind === "insufficient") {
    return { kind: "failure", message: WINDOW_TOO_SMALL }
  }
  const system = clip(input.system, systemLimit(budget.characters))
  const transcript = buildTranscript(input.messages, budget.characters - system.length)
  return { kind: "ready", text: assemblePrompt(system, transcript) }
}
