import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { REQUEST_ATTEMPTS } from "./constants"
import { ensureOk } from "./ensure-ok"
import { fetchGithub } from "./fetch-github"
import { headerOf, isRateLimited, retryDelayMs } from "./rate-limit"

export async function sendWithRetry(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
  attempt: number,
): Promise<Response> {
  const response = await fetchGithub(configuration, path, init)
  const retryAfter = headerOf(response, "retry-after")
  const remaining = headerOf(response, "x-ratelimit-remaining")
  if (isRateLimited(response.status, retryAfter, remaining) && attempt < REQUEST_ATTEMPTS) {
    console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
    await delay(retryDelayMs(response))
    return sendWithRetry(configuration, path, init, attempt + 1)
  }
  return ensureOk(response, path)
}
