import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { buildRoute } from "./build-route"
import { callApiWithoutBody } from "./call-api"
import { METHOD_DELETE } from "./constants"
import { type Comment } from "./types"

export async function deleteComments(
  runner: CommandRunner,
  settings: Settings,
  template: string,
  comments: Comment[],
): Promise<void> {
  for (const comment of comments) {
    await callApiWithoutBody(runner, METHOD_DELETE, buildRoute(template, settings, [String(comment.id)]))
  }
}
