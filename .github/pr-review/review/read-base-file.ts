import { type Settings } from "../settings"
import { type CommandRunner, runGit } from "../shell"
import { BASE_REFERENCE_SEPARATOR, SHOW_ARGUMENT } from "./constants"

export function readBaseFile(runner: CommandRunner, settings: Settings, path: string): string {
  return runGit(runner, [SHOW_ARGUMENT, settings.baseSha + BASE_REFERENCE_SEPARATOR + path])
}
