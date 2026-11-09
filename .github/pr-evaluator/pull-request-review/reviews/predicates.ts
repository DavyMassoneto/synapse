import { BOT_LOGIN } from "./constants"
import { type ListedReview } from "./types"

export function isBotReview(review: ListedReview, headSha: string): boolean {
  return review.commit_id === headSha && review.user instanceof Object && review.user.login === BOT_LOGIN
}
