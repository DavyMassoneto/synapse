import {
  MAX_PROMPT_BYTES,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_DIFF,
  PLACEHOLDER_PATTERN,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
  PROMPT_ENCODING,
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
    throw new Error(
      `O prompt tem ${bytes} bytes e excede o limite de ${MAX_PROMPT_BYTES}; o diff não é truncado, reduza a PR.`,
    )
  }
  return prompt
}

export function buildPrompt(context: PromptContext, diff: string): string {
  return ensureWithinLimit(fillTemplate(context, diff))
}
