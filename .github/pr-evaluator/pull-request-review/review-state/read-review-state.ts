import { type GithubConfiguration } from "#evaluator/configuration"
import { MAX_PAGES, PER_PAGE } from "./constants"
import { fetchReviewPage } from "./fetch-review-page"
import { hasMarkedReview, isLastPage } from "./predicates"
import { type ReviewState } from "./types"

export async function readReviewState(configuration: GithubConfiguration, marker: string): Promise<ReviewState> {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const reviews = await fetchReviewPage(configuration, page)
    if (hasMarkedReview(reviews, configuration.headSha, marker)) {
      return { kind: "reviewed" }
    }
    if (isLastPage(reviews)) {
      return { kind: "unreviewed" }
    }
  }
  throw new Error(`A PR tem mais de ${MAX_PAGES * PER_PAGE} reviews; a leitura do estado foi interrompida`)
}
