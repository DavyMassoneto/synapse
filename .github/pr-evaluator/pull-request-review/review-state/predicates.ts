import { BOT_LOGIN, PER_PAGE } from "./constants"
import { type ListedReview } from "./types"

export function isBotReview(review: ListedReview, headSha: string): boolean {
  return review.commit_id === headSha && review.user?.login === BOT_LOGIN
}

export function hasMarker(review: ListedReview, marker: string): boolean {
  return typeof review.body === "string" && review.body.includes(marker)
}

export function hasMarkedReview(reviews: ListedReview[], headSha: string, marker: string): boolean {
  return reviews.some((review) => isBotReview(review, headSha) && hasMarker(review, marker))
}

export function isLastPage(reviews: ListedReview[]): boolean {
  return reviews.length < PER_PAGE
}
