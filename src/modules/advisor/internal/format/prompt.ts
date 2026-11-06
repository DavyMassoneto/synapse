import { ADVISOR_SYSTEM, buildTranscript, clip } from "@/modules/advisor/internal/format";
import { type Consultation } from "@/modules/advisor/public/consultation";

// A conservative character estimate; it is not a provider tokenizer.
const ESTIMATED_CHARACTERS_PER_TOKEN = 3;
const RESPONSE_RESERVE_CHARACTERS = 2_048;
const MAX_SYSTEM_CHARACTERS = 40_000;
const PROMPT_PREFIX = "<executor_system_prompt>\n";
const TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n";
const PROMPT_SUFFIX =
  "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now.";

export function preparePrompt(input: Consultation, contextWindow: number): string | undefined {
  const available =
    contextWindow * ESTIMATED_CHARACTERS_PER_TOKEN -
    ADVISOR_SYSTEM.length -
    RESPONSE_RESERVE_CHARACTERS;
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
