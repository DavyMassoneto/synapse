import { ADVISOR_SYSTEM } from "@/modules/advisor/internal/instructions";
import { type Consultation, type ResolvedModel } from "@/modules/advisor/public/consultation";
import { buildTranscript, clip } from "./transcript.ts";

// A conservative character estimate; it is not a provider tokenizer.
const ESTIMATED_CHARACTERS_PER_TOKEN = 3;
const HOST_SAFETY_TOKENS = 4_096;
const MINIMUM_ANSWER_TOKENS = 1_024;
const MAX_SYSTEM_CHARACTERS = 40_000;
const PROMPT_PREFIX = "<executor_system_prompt>\n";
const TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n";
const PROMPT_SUFFIX =
  "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now.";

export function preparePrompt(input: Consultation, model: ResolvedModel): string | undefined {
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

  const systemLimit = Math.min(MAX_SYSTEM_CHARACTERS, Math.floor((available - fixedLength) / 2));
  const system = clip(input.system, systemLimit);
  const transcriptBudget = available - fixedLength - system.length;
  const transcript = buildTranscript(input.messages, transcriptBudget);
  return PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX;
}
