import { NO_TEXT } from "../separators"
import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { DIFF_ARGUMENTS, REPO_FLAG } from "./constants"
import { runGh } from "./run-gh"

export function fetchDiff(runner: CommandRunner, settings: Settings): Promise<string> {
  return runGh(runner, [...DIFF_ARGUMENTS, settings.prNumber, REPO_FLAG, settings.repo], NO_TEXT)
}
