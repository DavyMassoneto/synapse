import {
  MAX_PROMPT_BYTES,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_PATTERN,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
  PROMPT_ENCODING,
  PROMPT_TOO_LARGE,
} from "./constants"
import { type PromptContext } from "./types"

function placeholderText(context: PromptContext, marker: string): string {
  switch (marker) {
    case PLACEHOLDER_ARCHITECTURE:
      return context.architecture
    case PLACEHOLDER_RULES:
      return context.rules
    case PLACEHOLDER_STANDARDS:
      return context.standards
    default:
      return marker
  }
}

export function buildPrompt(context: PromptContext): string {
  const prompt = context.template.replace(PLACEHOLDER_PATTERN, placeholderText.bind(null, context))
  if (Buffer.byteLength(prompt, PROMPT_ENCODING) > MAX_PROMPT_BYTES) {
    throw new Error(PROMPT_TOO_LARGE)
  }
  return prompt
}
