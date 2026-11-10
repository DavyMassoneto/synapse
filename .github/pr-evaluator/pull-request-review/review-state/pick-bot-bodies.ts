import { hasBody, isBotReview } from "./predicates"
import { type ListedReview } from "./types"

export function pickBotBodies(reviews: ListedReview[], headSha: string): string[] {
  return reviews
    .filter((review) => isBotReview(review, headSha))
    .filter(hasBody)
    .map((review) => review.body)
}
