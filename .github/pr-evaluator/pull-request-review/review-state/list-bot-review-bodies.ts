import { type GithubConfiguration } from "#evaluator/configuration"
import { MAX_PAGES, PER_PAGE } from "./constants"
import { fetchReviewPage } from "./fetch-review-page"
import { pickBotBodies } from "./pick-bot-bodies"

export async function listBotReviewBodies(configuration: GithubConfiguration): Promise<string[]> {
  const bodies: string[] = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const reviews = await fetchReviewPage(configuration, page)
    bodies.push(...pickBotBodies(reviews, configuration.headSha))
    if (reviews.length < PER_PAGE) {
      return bodies
    }
  }
  throw new Error(`A PR tem mais de ${MAX_PAGES * PER_PAGE} reviews; a leitura do estado foi interrompida`)
}
