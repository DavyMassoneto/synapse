import { BOT_LOGIN } from "./constants"
import { type ListedReview, type ReviewWithBody } from "./types"

export function isBotReview(review: ListedReview, headSha: string): boolean {
  return review.commit_id === headSha && review.user instanceof Object && review.user.login === BOT_LOGIN
}

export function hasReviewMarker(bodies: string[], marker: string): boolean {
  return bodies.some((body) => body.includes(marker))
}

export function hasBody(review: ListedReview): review is ReviewWithBody {
  return typeof review.body === "string"
}
