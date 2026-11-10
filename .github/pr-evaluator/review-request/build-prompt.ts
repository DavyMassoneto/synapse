import { MAX_PROMPT_CHARACTERS, PLACEHOLDER_PATTERN } from "./constants"
import { isPlaceholder } from "./predicates"
import { type PlaceholderTexts, type PromptContext } from "./types"

function placeholderTexts(context: PromptContext, diff: string): PlaceholderTexts {
  return {
    "{{ARQUITETURA}}": context.architecture,
    "{{REGRAS}}": context.rules,
    "{{PADROES}}": context.standards,
    "{{DIFF}}": diff,
  }
}

function placeholderText(texts: PlaceholderTexts, marker: string): string {
  if (isPlaceholder(texts, marker)) {
    return texts[marker]
  }
  throw new Error(`Marcador desconhecido no modelo do prompt: ${marker}`)
}

function fillTemplate(context: PromptContext, diff: string): string {
  const texts = placeholderTexts(context, diff)
  return context.template.replace(PLACEHOLDER_PATTERN, (marker) => placeholderText(texts, marker))
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
