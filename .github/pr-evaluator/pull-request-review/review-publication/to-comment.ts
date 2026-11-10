import { isMultiLine } from "#evaluator/diff-annotation"
import { type Group } from "#evaluator/finding-placement"
import { commentBody } from "#evaluator/review-text"
import { type ReviewComment } from "./types"

export function toComment(group: Group): ReviewComment {
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
