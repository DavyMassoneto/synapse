import { type GithubConfiguration } from "#evaluator/configuration"
import { postJson } from "#evaluator/github-rest-client"
import { pullPath } from "../pull-lookup"
import { REVIEW_EVENT } from "./constants"
import { PublishedReviewSchema } from "./schemas"
import { type PublishedReview, type ReviewComment } from "./types"

export function publishReview(
  configuration: GithubConfiguration,
  body: string,
  comments: ReviewComment[],
): Promise<PublishedReview> {
  const payload = { commit_id: configuration.headSha, event: REVIEW_EVENT, body, comments }
  return postJson(configuration, `${pullPath(configuration)}/reviews`, JSON.stringify(payload), PublishedReviewSchema)
}
