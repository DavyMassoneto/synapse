import { commentBody } from "../comment-text"
import { type ReviewComment } from "../reviews"
import { isRange } from "./predicates"
import { type Group } from "./types"

export function toComment(group: Group): ReviewComment {
  const { anchor } = group
  const comment: ReviewComment = {
    path: anchor.path,
    line: anchor.line,
    side: anchor.side,
    body: commentBody(group.findings),
  }
  if (isRange(anchor)) {
    comment.start_line = anchor.startLine
    comment.start_side = anchor.side
  }
  return comment
}
