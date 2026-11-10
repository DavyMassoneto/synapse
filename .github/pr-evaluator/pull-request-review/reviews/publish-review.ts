import { type GithubConfiguration } from "#evaluator/configuration"
import { pullPath } from "../pull"
import { postJson } from "../rest-client"
import { PublishedReviewSchema } from "./constants"
import { type PublishedReview, type ReviewPayload } from "./types"

export function publishReview(configuration: GithubConfiguration, payload: ReviewPayload): Promise<PublishedReview> {
  return postJson(configuration, `${pullPath(configuration)}/reviews`, JSON.stringify(payload), PublishedReviewSchema)
}
