import { Value } from "typebox/value"
import { ReviewResultSchema } from "./constants"
import { type ReviewResult } from "./types"
import { unwrapFence } from "./unwrap-fence"

export function parseReviewResult(text: string): ReviewResult {
  try {
    return Value.Parse(ReviewResultSchema, JSON.parse(unwrapFence(text)))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resposta do modelo fora do formato esperado: ${error.message}`, { cause: error })
    }
    throw error
  }
}
