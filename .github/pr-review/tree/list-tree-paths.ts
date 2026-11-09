import { isIgnored } from "../diff"
import { LINE_BREAK } from "../separators"
import { type CommandRunner, runGit } from "../shell"
import { LIST_FILES_ARGUMENTS } from "./constants"

export function listTreePaths(runner: CommandRunner): string[] {
  return runGit(runner, LIST_FILES_ARGUMENTS)
    .split(LINE_BREAK)
    .filter((path) => path.length > 0 && !isIgnored(path))
}
