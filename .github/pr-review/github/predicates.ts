import { CommandError } from "../errors"
import { MARKER_PREFIX } from "../report"
import { BOT_LOGIN, RATE_LIMIT_MARKER } from "./constants"
import { type Comment } from "./types"

export function isRateLimited(error: Error): boolean {
  return error instanceof CommandError && error.message.toLowerCase().includes(RATE_LIMIT_MARKER)
}

export function isOwnComment(comment: Comment): boolean {
  return comment.user.login === BOT_LOGIN && comment.body.startsWith(MARKER_PREFIX)
}
