import { type Settings } from "../settings"
import { COMMENT_SIDE, REVIEW_EVENT } from "./constants"
import { type InlineComment, type ReviewComment, type ReviewPayload } from "./types"

export function buildReviewPayload(settings: Settings, inline: InlineComment[]): ReviewPayload {
  const comments: ReviewComment[] = inline.map((comment) => ({ ...comment, side: COMMENT_SIDE }))
  return { commit_id: settings.headSha, event: REVIEW_EVENT, comments }
}
