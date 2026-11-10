import { BOT_LOGIN, PER_PAGE } from "./constants"
import { type ListedReview } from "./types"

export function isEvaluatorReview(review: ListedReview, headSha: string, marker: string): boolean {
  return review.commit_id === headSha && review.user?.login === BOT_LOGIN && review.body?.startsWith(marker) === true
}

export function isLastPage(reviews: ListedReview[]): boolean {
  return reviews.length < PER_PAGE
}
