import { retry } from "../retry"
import { type CommandRunner } from "../shell"
import { GH_COMMAND, RATE_LIMIT_ATTEMPTS, RATE_LIMIT_BACKOFF_MS } from "./constants"
import { isRateLimited } from "./predicates"

export function runGh(runner: CommandRunner, args: string[], input: string): Promise<string> {
  return retry(() => Promise.resolve(runner({ command: GH_COMMAND, args, input })), {
    attempts: RATE_LIMIT_ATTEMPTS,
    backoffMs: RATE_LIMIT_BACKOFF_MS,
    isRetryable: isRateLimited,
  })
}
