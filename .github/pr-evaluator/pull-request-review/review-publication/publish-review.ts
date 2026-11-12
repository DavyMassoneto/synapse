import { type GithubConfiguration } from "#evaluator/configuration"
import { postJson } from "#evaluator/github-rest-client"
import { REVIEW_EVENT } from "./constants"
import { PublishedReviewSchema } from "./schemas"
import { type PublishedReview, type ReviewComment } from "./types"

export function publishReview(
  configuration: GithubConfiguration,
  body: string,
  comments: ReviewComment[],
): Promise<PublishedReview> {
  const payload = { commit_id: configuration.headSha, event: REVIEW_EVENT, body, comments }
  return postJson(
    configuration,
    `/repos/${configuration.repository}/pulls/${configuration.pullNumber}/reviews`,
    JSON.stringify(payload),
    PublishedReviewSchema,
  )
}
