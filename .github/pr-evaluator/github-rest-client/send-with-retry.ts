import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { ensureOk } from "#evaluator/http-failure"
import { DEFAULT_RETRY_SECONDS, MILLISECONDS_PER_SECOND, REQUEST_ATTEMPTS } from "./constants"
import { fetchGithub } from "./fetch-github"
import { isRateLimited, isRetryAfterSeconds } from "./predicates"

function retryDelayMs(response: Response): number {
  const seconds = Number(response.headers.get("retry-after"))
  if (isRetryAfterSeconds(seconds)) {
    return seconds * MILLISECONDS_PER_SECOND
  }
  return DEFAULT_RETRY_SECONDS * MILLISECONDS_PER_SECOND
}

export async function sendWithRetry(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
): Promise<Response> {
  let response = await fetchGithub(configuration, path, init)
  for (let attempt = 1; attempt < REQUEST_ATTEMPTS && isRateLimited(response); attempt += 1) {
    console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
    await response.body?.cancel()
    await delay(retryDelayMs(response))
    response = await fetchGithub(configuration, path, init)
  }
  return ensureOk(response, `GitHub (${path})`)
}
