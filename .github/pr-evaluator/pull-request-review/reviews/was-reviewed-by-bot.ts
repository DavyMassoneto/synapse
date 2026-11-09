import { type GithubConfiguration } from "#evaluator/configuration"
import { listBotReviewBodies } from "./list-bot-review-bodies"

export async function wasReviewedByBot(configuration: GithubConfiguration, marker: string): Promise<boolean> {
  const bodies = await listBotReviewBodies(configuration)
  return bodies.some((body) => body.includes(marker))
}
