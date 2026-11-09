import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { buildRoute, callApi, type MutationTiming, type ReviewComment, type ReviewPayload } from "./api"
import { deleteComments, listOwnComments } from "./comments"
import {
  COMMENT_SIDE,
  ISSUE_COMMENT,
  ISSUE_COMMENTS,
  METHOD_PATCH,
  METHOD_POST,
  PULL_COMMENT,
  PULL_COMMENTS,
  PULL_REVIEWS,
  REVIEW_EVENT,
} from "./constants"
import { type InlineComment } from "./types"

export async function publishSummary(
  runner: CommandRunner,
  settings: Settings,
  pages: string[],
  timing: MutationTiming,
): Promise<void> {
  const route = buildRoute(ISSUE_COMMENTS, settings, [settings.prNumber])
  const existing = await listOwnComments(runner, route, timing)
  for (const [index, page] of pages.entries()) {
    const target = existing.at(index)
    if (target === undefined) {
      await callApi(runner, METHOD_POST, route, { body: page }, timing)
    } else {
      await callApi(
        runner,
        METHOD_PATCH,
        buildRoute(ISSUE_COMMENT, settings, [String(target.id)]),
        { body: page },
        timing,
      )
    }
  }
  await deleteComments(runner, settings, ISSUE_COMMENT, existing.slice(pages.length), timing)
}

export async function replaceInlineComments(
  runner: CommandRunner,
  settings: Settings,
  inline: InlineComment[],
  timing: MutationTiming,
): Promise<void> {
  const existingInlineComments = await listOwnComments(
    runner,
    buildRoute(PULL_COMMENTS, settings, [settings.prNumber]),
    timing,
  )
  if (inline.length > 0) {
    await callApi(
      runner,
      METHOD_POST,
      buildRoute(PULL_REVIEWS, settings, [settings.prNumber]),
      buildReviewPayload(settings, inline),
      timing,
    )
  }
  await deleteComments(runner, settings, PULL_COMMENT, existingInlineComments, timing)
}

export function buildReviewPayload(settings: Settings, inline: InlineComment[]): ReviewPayload {
  const comments: ReviewComment[] = inline.map((comment) => ({ ...comment, side: COMMENT_SIDE }))
  return { commit_id: settings.headSha, event: REVIEW_EVENT, comments }
}
