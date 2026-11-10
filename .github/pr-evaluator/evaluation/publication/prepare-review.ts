import { type AnnotatedDiff, isMultiLine } from "#evaluator/diff-annotation"
import { type Group, placeFindings } from "#evaluator/finding-placement"
import { type ReviewComment } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { commentBody, reviewBody } from "#evaluator/review-text"
import { type PreparedReview } from "./types"

function toComment(group: Group): ReviewComment {
  const { anchor } = group
  const comment: ReviewComment = {
    path: anchor.path,
    line: anchor.line,
    side: anchor.side,
    body: commentBody(group.findings),
  }
  if (isMultiLine(anchor.startLine, anchor.line)) {
    comment.start_line = anchor.startLine
    comment.start_side = anchor.side
  }
  return comment
}

export function prepareReview(headSha: string, diff: AnnotatedDiff, result: ReviewResult): PreparedReview {
  const placement = placeFindings(diff.lines, result.findings)
  const comments = Array.from(placement.groups.values(), toComment)
  return {
    body: reviewBody(result, placement.unplaced, comments.length, headSha),
    comments,
    unplacedCount: placement.unplaced.length,
  }
}
