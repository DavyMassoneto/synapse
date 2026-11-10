import { isMultiLine } from "#evaluator/changes"
import { commentBody } from "../comment-text"
import { type ReviewComment } from "../reviews"
import { type Group } from "./types"

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
