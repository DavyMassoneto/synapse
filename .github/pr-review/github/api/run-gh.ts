import { retry } from "#synapse/retry"
import { NO_TEXT } from "#synapse/separators"
import { type Settings } from "#synapse/settings"
import { type CommandRunner } from "#synapse/shell"
import { fillTemplate } from "#synapse/templates"
import {
  API_ARGUMENTS,
  DIFF_ARGUMENTS,
  GH_COMMAND,
  INPUT_ARGUMENTS,
  METHOD_FLAG,
  RATE_LIMIT_ATTEMPTS,
  RATE_LIMIT_BACKOFF_MS,
  REPO_FLAG,
} from "./constants"
import { isRateLimited } from "./predicates"
import { type ApiPayload } from "./types"

export function runGh(runner: CommandRunner, args: string[], input: string): Promise<string> {
  return retry(() => Promise.resolve(runner({ command: GH_COMMAND, args, input })), {
    attempts: RATE_LIMIT_ATTEMPTS,
    backoffMs: RATE_LIMIT_BACKOFF_MS,
    isRetryable: isRateLimited,
  })
}

export async function callApi(
  runner: CommandRunner,
  method: string,
  route: string,
  payload: ApiPayload,
): Promise<void> {
  await runGh(runner, [...API_ARGUMENTS, METHOD_FLAG, method, route, ...INPUT_ARGUMENTS], JSON.stringify(payload))
}

export async function callApiWithoutBody(runner: CommandRunner, method: string, route: string): Promise<void> {
  await runGh(runner, [...API_ARGUMENTS, METHOD_FLAG, method, route], NO_TEXT)
}

export function buildRoute(template: string, settings: Settings, extra: string[]): string {
  return fillTemplate(template, [settings.repo, ...extra])
}

export function fetchDiff(runner: CommandRunner, settings: Settings): Promise<string> {
  return runGh(runner, [...DIFF_ARGUMENTS, settings.prNumber, REPO_FLAG, settings.repo], NO_TEXT)
}
