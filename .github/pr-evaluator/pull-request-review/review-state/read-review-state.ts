import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "#evaluator/github-rest-client"
import { MAX_PAGES, PER_PAGE } from "./constants"
import { isEvaluatorReview } from "./predicates"
import { ReviewListSchema } from "./schemas"
import { type ListedReview, type ReviewState } from "./types"

function fetchReviewPage(configuration: GithubConfiguration, page: number): Promise<ListedReview[]> {
  return getJson(
    configuration,
    `/repos/${configuration.repository}/pulls/${configuration.pullNumber}/reviews?per_page=${PER_PAGE}&page=${page}`,
    ReviewListSchema,
  )
}

export async function readReviewState(configuration: GithubConfiguration, marker: string): Promise<ReviewState> {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const reviews = await fetchReviewPage(configuration, page)
    if (reviews.some((review) => isEvaluatorReview(review, configuration.headSha, marker))) {
      return { kind: "reviewed" }
    }
    if (reviews.length < PER_PAGE) {
      return { kind: "unreviewed" }
    }
  }
  throw new Error(`A PR tem mais de ${MAX_PAGES * PER_PAGE} reviews; a leitura do estado foi interrompida`)
}
