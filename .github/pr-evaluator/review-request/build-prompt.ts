import {
  MAX_PROMPT_BYTES,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_DIFF,
  PLACEHOLDER_PATTERN,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
  PROMPT_ENCODING,
  PROMPT_LIMIT_DETAIL,
  PROMPT_NOT_TRUNCATED,
  PROMPT_TOO_LARGE,
} from "./constants"
import { type PromptContext } from "./types"

function placeholderText(context: PromptContext, diff: string, marker: string): string {
  if (marker === PLACEHOLDER_ARCHITECTURE) {
    return context.architecture
  }
  if (marker === PLACEHOLDER_RULES) {
    return context.rules
  }
  if (marker === PLACEHOLDER_STANDARDS) {
    return context.standards
  }
  if (marker === PLACEHOLDER_DIFF) {
    return diff
  }
  throw new Error(`Marcador desconhecido no modelo do prompt: ${marker}`)
}

function fillTemplate(context: PromptContext, diff: string): string {
  return context.template.replace(PLACEHOLDER_PATTERN, (marker) => placeholderText(context, diff, marker))
}

function ensureWithinLimit(prompt: string): string {
  const bytes = Buffer.byteLength(prompt, PROMPT_ENCODING)
  if (bytes > MAX_PROMPT_BYTES) {
    throw new Error(`${PROMPT_TOO_LARGE}${bytes}${PROMPT_LIMIT_DETAIL}${MAX_PROMPT_BYTES}${PROMPT_NOT_TRUNCATED}`)
  }
  return prompt
}

export function buildPrompt(context: PromptContext, diff: string): string {
  return ensureWithinLimit(fillTemplate(context, diff))
}
