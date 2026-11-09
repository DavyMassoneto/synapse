import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { buildReviewPayload } from "./build-review-payload"
import { buildRoute } from "./build-route"
import { callApi } from "./call-api"
import { METHOD_POST, PULL_COMMENT, PULL_COMMENTS, PULL_REVIEWS } from "./constants"
import { deleteComments } from "./delete-comments"
import { listOwnComments } from "./list-own-comments"
import { type InlineComment } from "./types"

export async function replaceInlineComments(
  runner: CommandRunner,
  settings: Settings,
  inline: InlineComment[],
): Promise<void> {
  const old = await listOwnComments(runner, buildRoute(PULL_COMMENTS, settings, [settings.prNumber]))
  if (inline.length > 0) {
    await callApi(
      runner,
      METHOD_POST,
      buildRoute(PULL_REVIEWS, settings, [settings.prNumber]),
      buildReviewPayload(settings, inline),
    )
  }
  await deleteComments(runner, settings, PULL_COMMENT, old)
}
