import { NO_TEXT } from "../separators"
import { GIT_COMMAND, GIT_NO_QUOTE_ARGUMENTS } from "./constants"
import { type CommandRunner } from "./types"

export function runGit(runner: CommandRunner, args: readonly string[]): string {
  return runner({ command: GIT_COMMAND, args: [...GIT_NO_QUOTE_ARGUMENTS, ...args], input: NO_TEXT })
}
