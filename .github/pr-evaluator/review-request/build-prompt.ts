import {
  MAX_PROMPT_BYTES,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_DIFF,
  PLACEHOLDER_PATTERN,
  PLACEHOLDER_RULES,
  PLACEHOLDER_SOURCE,
  PLACEHOLDER_STANDARDS,
  PROMPT_ENCODING,
} from "./constants"
import { type PromptContext, type ReviewInput } from "./types"

function placeholderText(context: PromptContext, input: ReviewInput, marker: string): string {
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
    return input.diff
  }
  if (marker === PLACEHOLDER_SOURCE) {
    return input.source
  }
  throw new Error(`Marcador desconhecido no modelo do prompt: ${marker}`)
}

function fillTemplate(context: PromptContext, input: ReviewInput): string {
  return context.template.replace(PLACEHOLDER_PATTERN, (marker) => placeholderText(context, input, marker))
}

function ensureWithinLimit(prompt: string): string {
  const bytes = Buffer.byteLength(prompt, PROMPT_ENCODING)
  if (bytes > MAX_PROMPT_BYTES) {
    throw new Error(
      `O prompt tem ${bytes} bytes e excede o limite de ${MAX_PROMPT_BYTES} (regras, código do commit e diff); nada é truncado.`,
    )
  }
  return prompt
}

export function buildPrompt(context: PromptContext, input: ReviewInput): string {
  return ensureWithinLimit(fillTemplate(context, input))
}
