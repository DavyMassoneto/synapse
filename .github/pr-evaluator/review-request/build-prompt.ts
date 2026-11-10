import {
  MAX_PROMPT_CHARACTERS,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_DIFF,
  PLACEHOLDER_PATTERN,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
} from "./constants"
import { type PromptContext } from "./types"

function placeholderValue(context: PromptContext, diff: string, placeholder: string): string {
  if (placeholder === PLACEHOLDER_ARCHITECTURE) {
    return context.architecture
  }
  if (placeholder === PLACEHOLDER_RULES) {
    return context.rules
  }
  if (placeholder === PLACEHOLDER_STANDARDS) {
    return context.standards
  }
  if (placeholder === PLACEHOLDER_DIFF) {
    return diff
  }
  throw new Error(`Marcador desconhecido no modelo do prompt: ${placeholder}`)
}

function fillTemplate(context: PromptContext, diff: string): string {
  return context.template.replace(PLACEHOLDER_PATTERN, (placeholder) => placeholderValue(context, diff, placeholder))
}

function ensureWithinLimit(prompt: string): string {
  if (prompt.length > MAX_PROMPT_CHARACTERS) {
    throw new Error(
      `O prompt tem ${prompt.length} caracteres e excede o limite de ${MAX_PROMPT_CHARACTERS}; o diff não é truncado, reduza a PR.`,
    )
  }
  return prompt
}

export function buildPrompt(context: PromptContext, diff: string): string {
  return ensureWithinLimit(fillTemplate(context, diff))
}
