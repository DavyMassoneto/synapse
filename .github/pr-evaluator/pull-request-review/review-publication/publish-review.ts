import { type GithubConfiguration } from "#evaluator/configuration"
import { postJson } from "#evaluator/github-rest-client"
import { pullPath } from "../pull-lookup"
import { PublishedReviewSchema } from "./constants"
import { type PublishedReview, type ReviewPayload } from "./types"

export function publishReview(configuration: GithubConfiguration, payload: ReviewPayload): Promise<PublishedReview> {
  return postJson(configuration, `${pullPath(configuration)}/reviews`, JSON.stringify(payload), PublishedReviewSchema)
}
