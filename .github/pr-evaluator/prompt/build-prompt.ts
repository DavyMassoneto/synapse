import {
  MAX_PROMPT_CHARACTERS,
  PLACEHOLDER_ARCHITECTURE,
  PLACEHOLDER_DIFF,
  PLACEHOLDER_RULES,
  PLACEHOLDER_STANDARDS,
} from "./constants"
import { type PromptContext } from "./types"

export function buildPrompt(context: PromptContext, diff: string): string {
  const prompt = context.template
    .split(PLACEHOLDER_ARCHITECTURE)
    .join(context.architecture)
    .split(PLACEHOLDER_RULES)
    .join(context.rules)
    .split(PLACEHOLDER_STANDARDS)
    .join(context.standards)
    .split(PLACEHOLDER_DIFF)
    .join(diff)
  if (prompt.length > MAX_PROMPT_CHARACTERS) {
    throw new Error(
      `O prompt tem ${prompt.length} caracteres e excede o limite de ${MAX_PROMPT_CHARACTERS}; o diff não é truncado, reduza a PR.`,
    )
  }
  return prompt
}
