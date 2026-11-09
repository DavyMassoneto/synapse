import { type GithubSettings } from "../settings"
import { BOT_LOGIN, MAX_PAGES, PER_PAGE, PublishedReviewSchema, PullSchema, ReviewListSchema } from "./constants"
import { getJson, postJson } from "./request"
import { type PublishedReview, type ReviewPayload } from "./types"

function pullPath(settings: GithubSettings): string {
  return `/repos/${settings.repository}/pulls/${settings.pullNumber}`
}

export async function currentHeadSha(settings: GithubSettings): Promise<string> {
  const pull = await getJson(settings, pullPath(settings), PullSchema)
  return pull.head.sha
}

export async function listBotReviewBodies(settings: GithubSettings): Promise<string[]> {
  const bodies: string[] = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const reviews = await getJson(
      settings,
      `${pullPath(settings)}/reviews?per_page=${PER_PAGE}&page=${page}`,
      ReviewListSchema,
    )
    for (const review of reviews) {
      if (typeof review.body === "string" && review.user instanceof Object && review.user.login === BOT_LOGIN) {
        bodies.push(review.body)
      }
    }
    if (reviews.length < PER_PAGE) {
      return bodies
    }
  }
  return bodies
}

export function publishReview(settings: GithubSettings, payload: ReviewPayload): Promise<PublishedReview> {
  return postJson(settings, `${pullPath(settings)}/reviews`, payload, PublishedReviewSchema)
}
