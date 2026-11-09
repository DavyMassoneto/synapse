import { LINE_BREAK } from "../separators"
import { type Settings } from "../settings"
import { type CommandRunner, runGit } from "../shell"
import { CONTEXT_ROOTS, CONTEXT_SUFFIXES, LIST_TREE_ARGUMENTS, PATHSPEC_SEPARATOR } from "./constants"

export function listBasePaths(runner: CommandRunner, settings: Settings): string[] {
  const listing = runGit(runner, [...LIST_TREE_ARGUMENTS, settings.baseSha, PATHSPEC_SEPARATOR, ...CONTEXT_ROOTS])
  return listing.split(LINE_BREAK).filter((path) => CONTEXT_SUFFIXES.some((suffix) => path.endsWith(suffix)))
}
