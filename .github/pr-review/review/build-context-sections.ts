import { LINE_BREAK, PARAGRAPH_BREAK } from "../separators"
import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { CONTEXT_HEADER } from "./constants"
import { listBasePaths } from "./list-base-paths"
import { readBaseFile } from "./read-base-file"

export function buildContextSections(runner: CommandRunner, settings: Settings): string[] {
  return listBasePaths(runner, settings).map(
    (path) => CONTEXT_HEADER + path + PARAGRAPH_BREAK + readBaseFile(runner, settings, path) + LINE_BREAK,
  )
}
