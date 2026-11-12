import {
  MAX_PROMPT_BYTES,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
  PROMPT_ENCODING,
  PROMPT_TOO_LARGE,
} from "./constants"
import { type PromptContext } from "./types"

export function buildPrompt(context: PromptContext): string {
  const prompt = context.template
    .replaceAll(PLACEHOLDER_ARCHITECTURE, context.architecture)
    .replaceAll(PLACEHOLDER_RULES, context.rules)
    .replaceAll(PLACEHOLDER_STANDARDS, context.standards)
  if (Buffer.byteLength(prompt, PROMPT_ENCODING) > MAX_PROMPT_BYTES) {
    throw new Error(PROMPT_TOO_LARGE)
  }
  return prompt
}
