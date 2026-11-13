import { type ReviewResult } from "#evaluator/review-result"
import {
  ESCAPED_LINE_SEPARATOR,
  ESCAPED_PARAGRAPH_SEPARATOR,
  LINE_SEPARATOR_PATTERN,
  PARAGRAPH_SEPARATOR_PATTERN,
  PRESERVED_REVIEW_LABEL,
} from "./constants"

export function recordReview(result: ReviewResult): void {
  const serialized = JSON.stringify(result)
    .replace(LINE_SEPARATOR_PATTERN, ESCAPED_LINE_SEPARATOR)
    .replace(PARAGRAPH_SEPARATOR_PATTERN, ESCAPED_PARAGRAPH_SEPARATOR)
  console.log(`${PRESERVED_REVIEW_LABEL}${serialized}`)
}
