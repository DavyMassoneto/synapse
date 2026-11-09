import { MARKER_PREFIX } from "#synapse/report"
import { BOT_LOGIN } from "./constants"
import { type Comment } from "./types"

export function isOwnComment(comment: Comment): boolean {
  return comment.user.login === BOT_LOGIN && comment.body.startsWith(MARKER_PREFIX)
}
