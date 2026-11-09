import { Value } from "typebox/value"
import { NO_TEXT } from "#synapse/separators"
import { type Settings } from "#synapse/settings"
import { type CommandRunner } from "#synapse/shell"
import { API_ARGUMENTS, buildRoute, callApiWithoutBody, type MutationTiming, runGh } from "../api"
import { METHOD_DELETE, PAGINATE_ARGUMENTS } from "./constants"
import { isOwnComment } from "./predicates"
import { CommentPagesSchema } from "./schemas"
import { type Comment } from "./types"

export async function listPaginated(runner: CommandRunner, route: string, timing: MutationTiming): Promise<Comment[]> {
  const output = await runGh(runner, [...API_ARGUMENTS, ...PAGINATE_ARGUMENTS, route], NO_TEXT, timing)
  return Value.Parse(CommentPagesSchema, JSON.parse(output)).flat()
}

export async function listOwnComments(
  runner: CommandRunner,
  route: string,
  timing: MutationTiming,
): Promise<Comment[]> {
  const comments = await listPaginated(runner, route, timing)
  return comments.filter((comment) => isOwnComment(comment))
}

export async function deleteComments(
  runner: CommandRunner,
  settings: Settings,
  template: string,
  comments: Comment[],
  timing: MutationTiming,
): Promise<void> {
  for (const comment of comments) {
    await callApiWithoutBody(runner, METHOD_DELETE, buildRoute(template, settings, [String(comment.id)]), timing)
  }
}
