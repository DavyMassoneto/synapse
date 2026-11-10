import { AssertError, Value } from "typebox/value"
import { FENCE_PATTERN, ISSUE_BREAK, ReviewResultSchema } from "./constants"
import { type ReviewResult } from "./types"

function unwrapFence(text: string): string {
  const trimmed = text.trim()
  const fenced = FENCE_PATTERN.exec(trimmed)
  if (fenced?.[1]) {
    return fenced[1]
  }
  return trimmed
}

function failureDetail(error: Error): string {
  if (error instanceof AssertError) {
    return error.cause.errors.map((issue) => `${issue.instancePath} ${issue.message}`).join(ISSUE_BREAK)
  }
  return error.message
}

export function parseReviewResult(text: string): ReviewResult {
  try {
    return Value.Parse(ReviewResultSchema, JSON.parse(unwrapFence(text)))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resposta do modelo fora do formato esperado: ${failureDetail(error)}`, { cause: error })
    }
    throw error
  }
}
