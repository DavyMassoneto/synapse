import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "../api"
import { pullPath } from "../pull"
import { MAX_PAGES, PER_PAGE, ReviewListSchema } from "./constants"
import { isBotReview } from "./predicates"

export async function listBotReviewBodies(configuration: GithubConfiguration): Promise<string[]> {
  const bodies: string[] = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const path = `${pullPath(configuration)}/reviews?per_page=${PER_PAGE}&page=${page}`
    const reviews = await getJson(configuration, path, ReviewListSchema)
    for (const review of reviews) {
      if (typeof review.body === "string" && isBotReview(review, configuration.headSha)) {
        bodies.push(review.body)
      }
    }
    if (reviews.length < PER_PAGE) {
      return bodies
    }
  }
  return bodies
}
