import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { placeFindings } from "#evaluator/finding-placement"
import { type ReviewResult } from "#evaluator/review-result"
import { reviewBody } from "#evaluator/review-text"
import { type PreparedReview } from "./types"

export function prepareReview(github: GithubConfiguration, diff: AnnotatedDiff, result: ReviewResult): PreparedReview {
  const placement = placeFindings(diff.lines, result.findings)
  return {
    unplacedCount: placement.unplaced.length,
    payload: {
      commit_id: github.headSha,
      event: "COMMENT",
      body: reviewBody(result, placement.unplaced, placement.comments.length, github.headSha),
      comments: placement.comments,
    },
  }
}
