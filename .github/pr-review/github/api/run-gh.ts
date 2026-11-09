import { CommandError } from "#synapse/errors"
import { NO_TEXT } from "#synapse/separators"
import { type Settings } from "#synapse/settings"
import { type CommandRunner } from "#synapse/shell"
import { fillTemplate } from "#synapse/templates"
import {
  API_ARGUMENTS,
  DIFF_ARGUMENTS,
  GH_COMMAND,
  INCLUDE_ARGUMENT,
  INPUT_ARGUMENTS,
  METHOD_FLAG,
  RATE_LIMIT_ATTEMPTS,
  REPO_FLAG,
} from "./constants"
import { isRateLimited } from "./predicates"
import { rateLimitDelay } from "./rate-limit"
import { paceMutation } from "./timing"
import { type ApiPayload, type MutationTiming } from "./types"

export async function runGh(
  runner: CommandRunner,
  args: string[],
  input: string,
  timing: MutationTiming,
): Promise<string> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      if (args.includes(METHOD_FLAG)) {
        await paceMutation(timing)
      }
      return runner({ command: GH_COMMAND, args, input })
    } catch (error) {
      if (!(error instanceof CommandError) || !isRateLimited(error)) {
        throw error
      }
      await timing.wait(rateLimitDelay(error, attempt, timing.now()))
      timing.hasMutation = false
      if (attempt >= RATE_LIMIT_ATTEMPTS) {
        throw error
      }
    }
  }
}

export async function callApi(
  runner: CommandRunner,
  method: string,
  route: string,
  payload: ApiPayload,
  timing: MutationTiming,
): Promise<void> {
  await runGh(
    runner,
    [...API_ARGUMENTS, INCLUDE_ARGUMENT, METHOD_FLAG, method, route, ...INPUT_ARGUMENTS],
    JSON.stringify(payload),
    timing,
  )
}

export async function callApiWithoutBody(
  runner: CommandRunner,
  method: string,
  route: string,
  timing: MutationTiming,
): Promise<void> {
  await runGh(runner, [...API_ARGUMENTS, INCLUDE_ARGUMENT, METHOD_FLAG, method, route], NO_TEXT, timing)
}

export function buildRoute(template: string, settings: Settings, extra: string[]): string {
  return fillTemplate(template, [settings.repo, ...extra])
}

export function fetchDiff(runner: CommandRunner, settings: Settings, timing: MutationTiming): Promise<string> {
  return runGh(runner, [...DIFF_ARGUMENTS, settings.prNumber, REPO_FLAG, settings.repo], NO_TEXT, timing)
}
