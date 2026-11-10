import { type PublishedReview } from "#evaluator/pull-request-review"
import { type PreparedReview } from "./types"

export function reportPublication(published: PublishedReview, prepared: PreparedReview): void {
  console.log(`Review ${published.html_url}: ${prepared.payload.comments.length} comentário(s) em linhas do diff`)
  console.log(`Apontamentos sem linha no diff: ${prepared.unplacedCount}`)
}
