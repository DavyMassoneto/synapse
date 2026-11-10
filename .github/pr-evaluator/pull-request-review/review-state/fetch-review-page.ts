import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "#evaluator/github-rest-client"
import { pullPath } from "../pull-lookup"
import { PER_PAGE, ReviewListSchema } from "./constants"
import { type ListedReview } from "./types"

export function fetchReviewPage(configuration: GithubConfiguration, page: number): Promise<ListedReview[]> {
  return getJson(
    configuration,
    `${pullPath(configuration)}/reviews?per_page=${PER_PAGE}&page=${page}`,
    ReviewListSchema,
  )
}
