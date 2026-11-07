import { ADVISOR_SYSTEM } from "#synapse/modules/advisor/internal/constants";
import type { Consultation, ResolvedModel } from "#synapse/modules/advisor/public";
import {
  ESTIMATED_CHARACTERS_PER_TOKEN,
  HOST_SAFETY_TOKENS,
  MAX_SYSTEM_CHARACTERS,
  MINIMUM_ANSWER_TOKENS,
} from "./limits.ts";
import { PROMPT_PREFIX, PROMPT_SUFFIX, TRANSCRIPT_PREFIX } from "./prompt-text.ts";
import { buildTranscript, clip } from "./transcript.ts";

function availableBudget(model: ResolvedModel): number | undefined {
  const requiredOutputTokens = model.reasoningTokens + MINIMUM_ANSWER_TOKENS;
  if (requiredOutputTokens > model.maxOutputTokens) {
    return undefined;
  }
  const inputTokens = model.contextWindow - HOST_SAFETY_TOKENS - model.maxOutputTokens;
  if (inputTokens <= 0) {
    return undefined;
  }
  const available = inputTokens * ESTIMATED_CHARACTERS_PER_TOKEN - ADVISOR_SYSTEM.length;
  const fixedLength = PROMPT_PREFIX.length + TRANSCRIPT_PREFIX.length + PROMPT_SUFFIX.length;
  if (available <= fixedLength) {
    return undefined;
  }

  return available - fixedLength;
}

export function preparePrompt(input: Consultation, model: ResolvedModel): string | undefined {
  const budget = availableBudget(model);
  if (budget === undefined) {
    return undefined;
  }
  const systemLimit = Math.min(MAX_SYSTEM_CHARACTERS, Math.floor(budget / 2));
  const system = clip(input.system, systemLimit);
  const transcriptBudget = budget - system.length;
  const transcript = buildTranscript(input.messages, transcriptBudget);
  return PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX;
}
