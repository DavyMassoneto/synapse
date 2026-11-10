import { type AnnotatedDiff } from "#evaluator/changes"
import { type GithubConfiguration } from "#evaluator/configuration"
import { placeFindings, reviewBody } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
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
