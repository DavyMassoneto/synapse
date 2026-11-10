import { MAX_PROMPT_CHARACTERS } from "./constants"

export function ensureWithinLimit(prompt: string): string {
  if (prompt.length > MAX_PROMPT_CHARACTERS) {
    throw new Error(
      `O prompt tem ${prompt.length} caracteres e excede o limite de ${MAX_PROMPT_CHARACTERS}; o diff não é truncado, reduza a PR.`,
    )
  }
  return prompt
}
