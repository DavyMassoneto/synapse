import { hasBody, isBotReview } from "./predicates"
import { type ListedReview } from "./types"

export function pickBotBodies(reviews: ListedReview[], headSha: string): string[] {
  const bodies: string[] = []
  for (const review of reviews) {
    if (isBotReview(review, headSha) && hasBody(review)) {
      bodies.push(review.body)
    }
  }
  return bodies
}
