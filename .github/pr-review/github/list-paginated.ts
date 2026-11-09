import { Value } from "typebox/value"
import { NO_TEXT } from "../separators"
import { type CommandRunner } from "../shell"
import { API_ARGUMENTS, PAGINATE_ARGUMENTS } from "./constants"
import { runGh } from "./run-gh"
import { CommentPagesSchema } from "./schemas"
import { type Comment } from "./types"

export async function listPaginated(runner: CommandRunner, route: string): Promise<Comment[]> {
  const output = await runGh(runner, [...API_ARGUMENTS, ...PAGINATE_ARGUMENTS, route], NO_TEXT)
  return Value.Parse(CommentPagesSchema, JSON.parse(output)).flat()
}
