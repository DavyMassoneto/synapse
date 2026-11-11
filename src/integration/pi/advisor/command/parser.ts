import { ARGUMENT_PATTERN, ARGUMENT_SEPARATOR, DISABLE_COMMAND, THINKING_COMMAND } from "./constants"
import { type AdvisorCommandInput } from "./types"

export function parseAdvisorCommand(args: string): AdvisorCommandInput {
  const input = args.trim()
  if (input === DISABLE_COMMAND) {
    return { kind: "disable" }
  }
  const [command, ...rest] = input.split(ARGUMENT_PATTERN)
  if (command === THINKING_COMMAND) {
    return { kind: "thinking", level: rest.join(ARGUMENT_SEPARATOR) }
  }
  return { kind: "select", query: input }
}
