import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { placeFindings } from "#evaluator/finding-placement"
import { toComment } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { reviewBody } from "#evaluator/review-text"
import { type PreparedReview } from "./types"

export function prepareReview(headSha: string, diff: AnnotatedDiff, result: ReviewResult): PreparedReview {
  const placement = placeFindings(diff.lines, result.findings)
  const comments = Array.from(placement.groups.values(), toComment)
  return {
    body: reviewBody(result, placement.unplaced, comments.length, headSha),
    comments,
    unplacedCount: placement.unplaced.length,
  }
}
