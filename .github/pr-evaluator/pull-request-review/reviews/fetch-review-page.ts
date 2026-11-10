import { type GithubConfiguration } from "#evaluator/configuration"
import { pullPath } from "../pull"
import { getJson } from "../rest-client"
import { PER_PAGE, ReviewListSchema } from "./constants"
import { type ListedReview } from "./types"

export function fetchReviewPage(configuration: GithubConfiguration, page: number): Promise<ListedReview[]> {
  return getJson(
    configuration,
    `${pullPath(configuration)}/reviews?per_page=${PER_PAGE}&page=${page}`,
    ReviewListSchema,
  )
}
