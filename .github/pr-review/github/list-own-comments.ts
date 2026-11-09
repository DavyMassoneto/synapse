import { type CommandRunner } from "../shell"
import { listPaginated } from "./list-paginated"
import { isOwnComment } from "./predicates"
import { type Comment } from "./types"

export async function listOwnComments(runner: CommandRunner, route: string): Promise<Comment[]> {
  const comments = await listPaginated(runner, route)
  return comments.filter((comment) => isOwnComment(comment))
}
