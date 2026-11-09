import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { buildRoute } from "./build-route"
import { callApi } from "./call-api"
import { ISSUE_COMMENT, ISSUE_COMMENTS, METHOD_PATCH, METHOD_POST } from "./constants"
import { deleteComments } from "./delete-comments"
import { listOwnComments } from "./list-own-comments"

export async function publishSummary(runner: CommandRunner, settings: Settings, pages: string[]): Promise<void> {
  const route = buildRoute(ISSUE_COMMENTS, settings, [settings.prNumber])
  const existing = await listOwnComments(runner, route)
  for (const [index, page] of pages.entries()) {
    const target = existing.at(index)
    if (target === undefined) {
      await callApi(runner, METHOD_POST, route, { body: page })
    } else {
      await callApi(runner, METHOD_PATCH, buildRoute(ISSUE_COMMENT, settings, [String(target.id)]), { body: page })
    }
  }
  await deleteComments(runner, settings, ISSUE_COMMENT, existing.slice(pages.length))
}
