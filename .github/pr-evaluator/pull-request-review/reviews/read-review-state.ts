import { type GithubConfiguration } from "#evaluator/configuration"
import { listBotReviewBodies } from "./list-bot-review-bodies"
import { hasReviewMarker } from "./predicates"
import { type ReviewState } from "./types"

export async function readReviewState(configuration: GithubConfiguration, marker: string): Promise<ReviewState> {
  if (hasReviewMarker(await listBotReviewBodies(configuration), marker)) {
    return { kind: "reviewed" }
  }
  return { kind: "unreviewed" }
}
